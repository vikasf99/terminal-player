'use client';

import { useEffect } from 'react';

import { usePlayerStore } from '@/stores/playerStore';
import type { SpotifyTrack } from '@/types/spotify';

export const useSpotifyPlaybackSync = (): void => {
  const setTrack = usePlayerStore((state) => state.setTrack);
  const setPlayback = usePlayerStore((state) => state.setPlayback);

  useEffect(() => {
    let intervalId: number | null = null;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch('/api/spotify/current-track', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { track: SpotifyTrack | null };
        setTrack(data.track);
        setPlayback(Boolean(data.track?.is_playing), data.track?.progress_ms ?? 0);
      } catch {
        // keep last known state
      }
    };

    const start = (): void => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      void poll();
      intervalId = window.setInterval(() => {
        void poll();
      }, 3000);
    };

    const stop = (): void => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const onVisibility = (): void => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [setPlayback, setTrack]);
};
