'use client';

import { useEffect, useState } from 'react';

import type { SpotifyTrack } from '@/types/spotify';

type PlaylistTracksState = {
  tracks: SpotifyTrack[];
  isLoading: boolean;
  error: string | null;
};

export const usePlaylistTracks = (playlistId: string | null): PlaylistTracksState => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playlistId) {
      setTracks([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const load = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/spotify/playlist-tracks?playlistId=${encodeURIComponent(playlistId)}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`failed to load tracks (${response.status})`);
        }
        const data = (await response.json()) as { tracks: SpotifyTrack[] };
        if (!cancelled) {
          setTracks(data.tracks);
          setError(null);
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

  return { tracks, isLoading, error };
};
