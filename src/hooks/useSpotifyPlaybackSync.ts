'use client';

import { useEffect } from 'react';

import { shouldApplyRemoteVolume } from '@/lib/volumeApi';
import { usePlayerStore } from '@/stores/playerStore';
import type { SpotifyTrack } from '@/types/spotify';

type PlaybackResponse = {
  track: SpotifyTrack | null;
  volumePercent: number | null;
  isPlaying?: boolean;
  progressMs?: number;
  device?: { id: string; name: string; type: string } | null;
};

export const useSpotifyPlaybackSync = (): void => {
  const setTrack = usePlayerStore((state) => state.setTrack);
  const setPlayback = usePlayerStore((state) => state.setPlayback);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setPlaybackDevice = usePlayerStore((state) => state.setPlaybackDevice);

  useEffect(() => {
    let intervalId: number | null = null;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch('/api/spotify/current-track', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as PlaybackResponse;

        if (data.track) {
          setTrack(data.track);
        }

        const isPlaying = data.isPlaying ?? Boolean(data.track?.is_playing);
        const progressMs = data.progressMs ?? data.track?.progress_ms ?? 0;
        setPlayback(isPlaying, progressMs);

        if (data.device?.id) {
          setPlaybackDevice(data.device.id, data.device.name);
        }

        if (typeof data.volumePercent === 'number' && shouldApplyRemoteVolume()) {
          const current = usePlayerStore.getState().volumePercent;
          if (Math.abs(current - data.volumePercent) >= 1) {
            setVolume(data.volumePercent);
          }
        }
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
      }, 800);
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
  }, [setPlayback, setPlaybackDevice, setTrack, setVolume]);
};
