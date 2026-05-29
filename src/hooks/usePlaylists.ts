'use client';

import { useEffect, useState } from 'react';

import type { SpotifyPlaylist } from '@/types/spotify';
import type { SpotifyAccessErrorBody, SpotifyAccessReason } from '@/types/spotifyAccess';

type PlaylistsState = {
  playlists: SpotifyPlaylist[];
  isLoading: boolean;
  error: string | null;
  accessReason: SpotifyAccessReason | null;
};

export const usePlaylists = (): PlaylistsState => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessReason, setAccessReason] = useState<SpotifyAccessReason | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (retried = false): Promise<void> => {
      try {
        const response = await fetch('/api/spotify/playlist', { cache: 'no-store' });
        let data: SpotifyAccessErrorBody & { playlists?: SpotifyPlaylist[] } = {};

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
          if (!cancelled) {
            setPlaylists([]);
            if (data.needsAllowlist || data.reason === 'dev_mode_allowlist' || response.status === 403) {
              setAccessReason('dev_mode_allowlist');
              setError('playlist access not enabled for this spotify account');
            } else if (data.needsReauth || response.status === 401) {
              setAccessReason('session_expired');
              setError('session expired');
            } else {
              setAccessReason('unknown');
              setError(`could not load playlists (${response.status})`);
            }
          }
          return;
        }

        if (!cancelled) {
          setPlaylists(data.playlists ?? []);
          setError(null);
          setAccessReason(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'unknown error');
          setAccessReason('unknown');
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

  return { playlists, isLoading, error, accessReason };
};
