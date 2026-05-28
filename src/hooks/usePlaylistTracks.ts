'use client';

import { useEffect, useState } from 'react';

import type { SpotifyTrack } from '@/types/spotify';

type PlaylistTracksState = {
  tracks: SpotifyTrack[];
  isLoading: boolean;
  error: string | null;
  needsReauth: boolean;
};

export const usePlaylistTracks = (playlistId: string | null): PlaylistTracksState => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);

  useEffect(() => {
    if (!playlistId) {
      setTracks([]);
      setIsLoading(false);
      setError(null);
      setNeedsReauth(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setNeedsReauth(false);

    const load = async (retried = false): Promise<void> => {
      try {
        const response = await fetch(`/api/spotify/playlist-tracks?playlistId=${encodeURIComponent(playlistId)}`, {
          cache: 'no-store',
        });

        let data: { tracks?: SpotifyTrack[]; error?: string; needsReauth?: boolean } = {};
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
              setTracks([]);
              setNeedsReauth(true);
              setError('track access denied — re-authenticate to load playlist tracks');
            }
            return;
          }
          throw new Error(`failed to load tracks (${response.status})`);
        }

        if (!cancelled) {
          setTracks(data.tracks ?? []);
          setError(null);
          setNeedsReauth(false);
        }
      } catch (err) {
        if (!cancelled) {
          setTracks([]);
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
  }, [playlistId]);

  return { tracks, isLoading, error, needsReauth };
};
