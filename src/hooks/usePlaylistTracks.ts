'use client';

import { useEffect, useState } from 'react';

import type { SpotifyTrack } from '@/types/spotify';
import type { SpotifyAccessErrorBody, SpotifyAccessReason } from '@/types/spotifyAccess';

type PlaylistTracksState = {
  tracks: SpotifyTrack[];
  isLoading: boolean;
  error: string | null;
  accessReason: SpotifyAccessReason | null;
  playlistTotal: number;
};

export const usePlaylistTracks = (playlistId: string | null): PlaylistTracksState => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessReason, setAccessReason] = useState<SpotifyAccessReason | null>(null);
  const [playlistTotal, setPlaylistTotal] = useState(0);

  useEffect(() => {
    if (!playlistId) {
      setTracks([]);
      setIsLoading(false);
      setError(null);
      setAccessReason(null);
      setPlaylistTotal(0);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setAccessReason(null);
    setPlaylistTotal(0);

    const load = async (retried = false): Promise<void> => {
      try {
        const response = await fetch(`/api/spotify/playlist-tracks?playlistId=${encodeURIComponent(playlistId)}`, {
          cache: 'no-store',
        });

        let data: SpotifyAccessErrorBody & { tracks?: SpotifyTrack[]; playlistTotal?: number } = {};
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
            setTracks([]);
            if (data.needsAllowlist || data.reason === 'dev_mode_allowlist' || response.status === 403) {
              setAccessReason('dev_mode_allowlist');
              setError('track access not enabled for this spotify account');
            } else if (data.needsReauth || response.status === 401) {
              setAccessReason('session_expired');
              setError('session expired');
            } else {
              setAccessReason('unknown');
              setError(`failed to load tracks (${response.status})`);
            }
          }
          return;
        }

        if (!cancelled) {
          const loaded = data.tracks ?? [];
          const total = data.playlistTotal ?? 0;
          setTracks(loaded);
          setPlaylistTotal(total);
          if (loaded.length === 0 && total > 0) {
            setAccessReason('dev_mode_allowlist');
            setError('tracks blocked for this account — invitation required');
          } else if (loaded.length === 0) {
            setError(null);
            setAccessReason(null);
          } else {
            setError(null);
            setAccessReason(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setTracks([]);
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
  }, [playlistId]);

  return { tracks, isLoading, error, accessReason, playlistTotal };
};
