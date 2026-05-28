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

export const getUserPlaylists = async (token: string): Promise<SpotifyPlaylist[]> => {
  const data = await spotifyFetch<{ items: SpotifyPlaylist[] }>('/me/playlists?limit=50', token);
  return data.items;
};
