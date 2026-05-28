'use client';

import { useEffect, useState } from 'react';

import type { SpotifyTrack } from '@/types/spotify';

type CurrentTrackState = {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  progressMs: number;
  error: string | null;
};

export const useCurrentTrack = (): CurrentTrackState => {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressMs, setProgressMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: number | null = null;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch('/api/spotify/current-track', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`failed to fetch current track (${response.status})`);
        }

        const data = (await response.json()) as { track: SpotifyTrack | null };
        setTrack(data.track);
        setIsPlaying(Boolean(data.track?.is_playing));
        setProgressMs(data.track?.progress_ms ?? 0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'unknown error');
      }
    };

    const startPolling = (): void => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      void poll();
      intervalId = window.setInterval(() => {
        void poll();
      }, 3000);
    };

    const stopPolling = (): void => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const onVisibilityChange = (): void => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return { track, isPlaying, progressMs, error };
};
