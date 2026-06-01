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

export type PlaybackSnapshot = {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  progressMs: number;
  volumePercent: number | null;
  device: { id: string; name: string; type: string } | null;
};

export const getPlaybackSnapshot = async (token: string): Promise<PlaybackSnapshot> => {
  try {
    const data = await spotifyFetch<{
      is_playing: boolean;
      progress_ms: number;
      item: SpotifyTrack | null;
      device?: {
        id?: string;
        name?: string;
        type?: string;
        volume_percent?: number | null;
      };
    }>('/me/player', token);

    const track = data.item
      ? {
          ...data.item,
          is_playing: data.is_playing,
          progress_ms: data.progress_ms,
        }
      : null;

    const device =
      data.device?.id && data.device.name
        ? {
            id: data.device.id,
            name: data.device.name,
            type: data.device.type ?? 'Unknown',
          }
        : null;

    return {
      track,
      isPlaying: data.is_playing,
      progressMs: data.progress_ms ?? 0,
      volumePercent:
        typeof data.device?.volume_percent === 'number' ? data.device.volume_percent : null,
      device,
    };
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 204) {
      return { track: null, isPlaying: false, progressMs: 0, volumePercent: null, device: null };
    }
    throw error;
  }
};

export const getCurrentTrack = async (token: string): Promise<SpotifyTrack | null> => {
  const snapshot = await getPlaybackSnapshot(token);
  return snapshot.track;
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

type PlaylistItemPayload = SpotifyTrack & {
  type?: string;
  linked_from?: { id?: string };
};

type PlaylistItemEntry = {
  track?: PlaylistItemPayload | null;
  item?: PlaylistItemPayload | null;
  is_local?: boolean;
};

type PlaylistPaging = {
  total?: number;
  items?: PlaylistItemEntry[];
};

const resolvePlaylistTotal = (playlist: {
  items?: { total?: number };
  tracks?: { total?: number };
}): number => playlist.items?.total ?? playlist.tracks?.total ?? 0;

const resolveTrackId = (raw: PlaylistItemEntry['track'] | PlaylistItemEntry['item']): string | null => {
  if (!raw) {
    return null;
  }
  if (raw.id) {
    return raw.id;
  }
  const linked = (raw as { linked_from?: { id?: string } }).linked_from?.id;
  return linked ?? null;
};

const normalizeTrack = (raw: SpotifyTrack, fallbackId?: string): SpotifyTrack | null => {
  const id = raw.id ?? fallbackId ?? null;
  if (!id) {
    return null;
  }
  return {
    id,
    name: raw.name ?? 'unknown track',
    artists: raw.artists ?? [],
    album: raw.album ?? { id: '', name: 'unknown' },
    duration_ms: raw.duration_ms ?? 0,
  };
};

const extractTrackFromEntry = (entry: PlaylistItemEntry): SpotifyTrack | null => {
  const payload = entry.item ?? entry.track;
  if (!payload) {
    return null;
  }

  if (payload.type && payload.type !== 'track') {
    return null;
  }

  const id = resolveTrackId(payload);
  if (id) {
    return normalizeTrack({ ...payload, id }, id);
  }

  if (entry.is_local && payload.name) {
    return normalizeTrack({ ...payload, id: `local-${payload.name}` });
  }

  return null;
};

const collectTracks = (items: PlaylistItemEntry[]): SpotifyTrack[] => {
  const tracks: SpotifyTrack[] = [];
  for (const entry of items) {
    const track = extractTrackFromEntry(entry);
    if (track) {
      tracks.push(track);
    }
  }
  return tracks;
};

export const getUserPlaylists = async (token: string): Promise<SpotifyPlaylist[]> => {
  const data = await spotifyFetch<{
    items: Array<SpotifyPlaylist & { items?: { total?: number }; tracks?: { total?: number } }>;
  }>('/me/playlists?limit=50', token);

  return data.items.map((playlist) => ({
    id: playlist.id,
    name: playlist.name ?? 'untitled playlist',
    description: playlist.description ?? '',
    tracks: { total: resolvePlaylistTotal(playlist) },
  }));
};

const buildPlaylistItemsParams = (
  offset: number,
  limit: number,
  market?: string,
): URLSearchParams => {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    additional_types: 'track,episode',
  });
  if (market) {
    params.set('market', market);
  }
  return params;
};

const fetchPlaylistItemsPage = async (
  token: string,
  playlistId: string,
  offset: number,
  limit: number,
  market: string | undefined,
  useLegacyTracksEndpoint: boolean,
): Promise<{ items: PlaylistItemEntry[]; next: string | null }> => {
  const params = buildPlaylistItemsParams(offset, limit, market);
  const segment = useLegacyTracksEndpoint ? 'tracks' : 'items';

  return spotifyFetch<{ items: PlaylistItemEntry[]; next: string | null }>(
    `/playlists/${playlistId}/${segment}?${params.toString()}`,
    token,
  );
};

const paginatePlaylistItems = async (
  token: string,
  playlistId: string,
  market: string | undefined,
  useLegacyTracksEndpoint: boolean,
): Promise<SpotifyTrack[]> => {
  const tracks: SpotifyTrack[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const data = await fetchPlaylistItemsPage(
      token,
      playlistId,
      offset,
      limit,
      market,
      useLegacyTracksEndpoint,
    );
    tracks.push(...collectTracks(data.items));

    if (!data.next) {
      break;
    }
    offset += limit;
  }

  return tracks;
};

const fetchPlaylistItemsFallback = async (
  token: string,
  playlistId: string,
  market?: string,
): Promise<SpotifyTrack[]> => {
  const params = new URLSearchParams();
  if (market) {
    params.set('market', market);
  }

  const query = params.toString();
  const data = await spotifyFetch<{
    items?: PlaylistPaging;
    tracks?: PlaylistPaging;
  }>(`/playlists/${playlistId}${query ? `?${query}` : ''}`, token);

  const entries = data.items?.items ?? data.tracks?.items ?? [];
  return collectTracks(entries);
};

export const getPlaylistTrackCount = async (token: string, playlistId: string): Promise<number> => {
  try {
    const data = await spotifyFetch<{
      items?: { total?: number };
      tracks?: { total?: number };
    }>(`/playlists/${playlistId}?fields=items(total),tracks(total)`, token);
    return resolvePlaylistTotal(data);
  } catch {
    return 0;
  }
};

export const getPlaylistTracks = async (token: string, playlistId: string): Promise<SpotifyTrack[]> => {
  const market = await getUserMarket(token);
  const markets = market ? [undefined, market] : [undefined];
  const endpointModes = [false, true] as const;

  for (const useLegacy of endpointModes) {
    for (const attemptMarket of markets) {
      try {
        const tracks = await paginatePlaylistItems(token, playlistId, attemptMarket, useLegacy);
        if (tracks.length > 0) {
          return tracks;
        }
      } catch (error) {
        if (error instanceof SpotifyApiError && (error.status === 403 || error.status === 404)) {
          continue;
        }
        throw error;
      }
    }
  }

  for (const attemptMarket of markets) {
    try {
      const tracks = await fetchPlaylistItemsFallback(token, playlistId, attemptMarket);
      if (tracks.length > 0) {
        return tracks;
      }
    } catch (error) {
      if (error instanceof SpotifyApiError && error.status === 403) {
        continue;
      }
      throw error;
    }
  }

  return [];
};
