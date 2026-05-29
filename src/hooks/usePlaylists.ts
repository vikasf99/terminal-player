'use client';

import { useEffect, useState } from 'react';

import type { SpotifyPlaylist } from '@/types/spotify';

type PlaylistsState = {
  playlists: SpotifyPlaylist[];
  isLoading: boolean;
  error: string | null;
  needsReauth: boolean;
};

export const usePlaylists = (): PlaylistsState => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async (retried = false): Promise<void> => {
      try {
        const response = await fetch('/api/spotify/playlist', { cache: 'no-store' });
        let data: {
          playlists?: SpotifyPlaylist[];
          error?: string;
          needsReauth?: boolean;
        } = {};

        try {
          data = (await response.json()) as typeof data;
        } catch {
          data = {};
        }

        if (response.status === 403 && !retried) {
          const refresh = await fetch('/api/auth/refresh', { method: 'POST' });
          if (refresh.ok) {
            await load(true);
            return;
          }
        }

        if (!response.ok) {
          if (data.needsReauth || response.status === 403) {
            if (!cancelled) {
              setNeedsReauth(true);
              setError('could not load playlists — sign in again with spotify premium');
            }
            return;
          }
          throw new Error(`failed to load playlists (${response.status})`);
        }

        if (!cancelled) {
          setPlaylists(data.playlists ?? []);
          setError(null);
          setNeedsReauth(false);
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

  return { playlists, isLoading, error, needsReauth };
};
