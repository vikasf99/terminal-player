import { cookies, headers } from 'next/headers';

import type { SpotifyAudioFeatures, SpotifyPlaylist, SpotifyTrack } from '@/types/spotify';

export class SpotifyApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'SpotifyApiError';
    this.status = status;
  }
}

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export const getAccessToken = (): string | null => {
  const cookieToken = cookies().get('access_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = headers().get('authorization');
  if (!authHeader) {
    return null;
  }

  const [type, token] = authHeader.split(' ');
  if (type?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

const spotifyFetch = async <T>(path: string, token: string): Promise<T> => {
  const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new SpotifyApiError(
      `spotify api request failed: ${response.status} ${errorBody}`,
      response.status,
    );
  }

  return (await response.json()) as T;
};

export const getCurrentTrack = async (token: string): Promise<SpotifyTrack | null> => {
  try {
    const data = await spotifyFetch<{
      is_playing: boolean;
      progress_ms: number;
      item: SpotifyTrack | null;
    }>('/me/player/currently-playing', token);

    if (!data.item) {
      return null;
    }

    return {
      ...data.item,
      is_playing: data.is_playing,
      progress_ms: data.progress_ms,
    };
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 204) {
      return null;
    }
    throw error;
  }
};

export const getAudioFeatures = async (
  token: string,
  trackId: string,
): Promise<SpotifyAudioFeatures> => {
  return spotifyFetch<SpotifyAudioFeatures>(`/audio-features/${trackId}`, token);
};

const getUserMarket = async (token: string): Promise<string | undefined> => {
  try {
    const profile = await spotifyFetch<{ country?: string }>('/me', token);
    return profile.country;
  } catch {
    return undefined;
  }
};

const normalizeTrack = (track: SpotifyTrack | null): SpotifyTrack | null => {
  if (!track?.id) {
    return null;
  }
  return {
    ...track,
    name: track.name ?? 'unknown track',
    artists: track.artists ?? [],
    album: track.album ?? { id: '', name: 'unknown' },
    duration_ms: track.duration_ms ?? 0,
  };
};

const collectTracks = (items: Array<{ track: SpotifyTrack | null }>): SpotifyTrack[] => {
  const tracks: SpotifyTrack[] = [];
  for (const item of items) {
    const track = normalizeTrack(item.track);
    if (track) {
      tracks.push(track);
    }
  }
  return tracks;
};

export const getUserPlaylists = async (token: string): Promise<SpotifyPlaylist[]> => {
  const data = await spotifyFetch<{ items: SpotifyPlaylist[] }>(
    '/me/playlists?limit=50&fields=items(id,name,description,tracks(total)),next',
    token,
  );
  return data.items.map((playlist) => ({
    ...playlist,
    name: playlist.name ?? 'untitled playlist',
    description: playlist.description ?? '',
    tracks: { total: playlist.tracks?.total ?? 0 },
  }));
};

const fetchPlaylistTracksPage = async (
  token: string,
  playlistId: string,
  offset: number,
  limit: number,
  market?: string,
): Promise<{ items: Array<{ track: SpotifyTrack | null }>; next: string | null }> => {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    additional_types: 'track',
  });
  if (market) {
    params.set('market', market);
  }

  return spotifyFetch<{ items: Array<{ track: SpotifyTrack | null }>; next: string | null }>(
    `/playlists/${playlistId}/tracks?${params.toString()}`,
    token,
  );
};

const fetchPlaylistTracksFallback = async (
  token: string,
  playlistId: string,
  market?: string,
): Promise<SpotifyTrack[]> => {
  const params = new URLSearchParams({
    fields: 'tracks.items(track(id,name,artists,album,duration_ms))',
  });
  if (market) {
    params.set('market', market);
  }

  const data = await spotifyFetch<{
    tracks?: { items: Array<{ track: SpotifyTrack | null }> };
  }>(`/playlists/${playlistId}?${params.toString()}`, token);

  return collectTracks(data.tracks?.items ?? []);
};

export const getPlaylistTracks = async (token: string, playlistId: string): Promise<SpotifyTrack[]> => {
  const market = await getUserMarket(token);
  const tracks: SpotifyTrack[] = [];
  let offset = 0;
  const limit = 100;

  try {
    while (true) {
      const data = await fetchPlaylistTracksPage(token, playlistId, offset, limit, market);
      tracks.push(...collectTracks(data.items));

      if (!data.next) {
        break;
      }
      offset += limit;
    }
    return tracks;
  } catch (error) {
    if (!(error instanceof SpotifyApiError) || error.status !== 403) {
      throw error;
    }
  }

  return fetchPlaylistTracksFallback(token, playlistId, market);
};
