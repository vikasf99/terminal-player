'use client';

import { useEffect, useRef } from 'react';

import { usePlayerStore } from '@/stores/playerStore';
import type { BeatData } from '@/types/beat';
import type { SpotifyTrack } from '@/types/spotify';

type TrackFeatures = {
  energy: number;
  tempo: number;
};

export const useSpotifyBeatSync = (track: SpotifyTrack | null, isPlaying: boolean): void => {
  const setBeatData = usePlayerStore((state) => state.setBeatData);
  const volumePercent = usePlayerStore((state) => state.volumePercent);
  const featuresRef = useRef<TrackFeatures>({ energy: 0.5, tempo: 120 });
  const lastBeatIndexRef = useRef(-1);

  useEffect(() => {
    lastBeatIndexRef.current = -1;
    if (!track?.id) {
      return;
    }

    let cancelled = false;

    const loadFeatures = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/spotify/audio-features?trackId=${encodeURIComponent(track.id)}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { energy: number; tempo: number };
        if (!cancelled) {
          featuresRef.current = {
            energy: Math.max(0, Math.min(1, data.energy ?? 0.5)),
            tempo: Math.max(60, Math.min(200, data.tempo ?? 120)),
          };
        }
      } catch {
        if (!cancelled) {
          featuresRef.current = { energy: 0.5, tempo: 120 };
        }
      }
    };

    void loadFeatures();
    return () => {
      cancelled = true;
    };
  }, [track?.id]);

  useEffect(() => {
    if (!track?.id || !isPlaying || volumePercent <= 0) {
      setBeatData({ isBeat: false, intensity: 0, bpm: 0, bassEnergy: 0 });
      lastBeatIndexRef.current = -1;
      return;
    }

    const tick = (): void => {
      const { energy, tempo } = featuresRef.current;
      const progressMs = usePlayerStore.getState().getInterpolatedProgressMs();
      const msPerBeat = 60_000 / tempo;
      const beatIndex = Math.floor(progressMs / msPerBeat);
      const isNewBeat = beatIndex !== lastBeatIndexRef.current;
      if (isNewBeat) {
        lastBeatIndexRef.current = beatIndex;
      }

      const phase = msPerBeat > 0 ? (progressMs % msPerBeat) / msPerBeat : 0;
      const beatEnvelope = isNewBeat ? 1 : Math.max(0, 1 - phase * 1.15);
      const vol = volumePercent / 100;
      const intensity = energy * beatEnvelope * vol;

      const beatData: BeatData = {
        isBeat: isNewBeat,
        intensity,
        bpm: Math.round(tempo),
        bassEnergy: energy * vol,
      };
      setBeatData(beatData);
    };

    tick();
    const timer = window.setInterval(tick, 50);
    return () => window.clearInterval(timer);
  }, [isPlaying, setBeatData, track?.id, volumePercent]);
};
