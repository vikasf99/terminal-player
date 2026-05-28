'use client';

import { useEffect, useState } from 'react';

import type { SpotifyPlaylist } from '@/types/spotify';

type PlaylistsState = {
  playlists: SpotifyPlaylist[];
  isLoading: boolean;
  error: string | null;
};

export const usePlaylists = (): PlaylistsState => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const response = await fetch('/api/spotify/playlist', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`failed to load playlists (${response.status})`);
        }
        const data = (await response.json()) as { playlists: SpotifyPlaylist[] };
        if (!cancelled) {
          setPlaylists(data.playlists);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'unknown error');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { playlists, isLoading, error };
};
