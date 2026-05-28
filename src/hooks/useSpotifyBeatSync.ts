'use client';

import { useEffect } from 'react';

import { usePlayerStore } from '@/stores/playerStore';
import type { BeatData } from '@/types/beat';
import type { SpotifyTrack } from '@/types/spotify';

const energyToBeat = (energy: number, tempo: number, tick: number): BeatData => {
  const msPerBeat = tempo > 0 ? 60_000 / tempo : 500;
  const phase = tick % msPerBeat;
  const isBeat = phase < 90;
  const intensity = Math.max(0, Math.min(1, energy));
  return {
    isBeat,
    intensity,
    bpm: Math.round(tempo),
    bassEnergy: intensity,
  };
};

export const useSpotifyBeatSync = (track: SpotifyTrack | null, isPlaying: boolean): void => {
  const setBeatData = usePlayerStore((state) => state.setBeatData);

  useEffect(() => {
    if (!track?.id || !isPlaying) {
      setBeatData({ isBeat: false, intensity: 0, bpm: 0, bassEnergy: 0 });
      return;
    }

    let cancelled = false;
    let features: { energy: number; tempo: number } | null = null;

    const loadFeatures = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/spotify/audio-features?trackId=${encodeURIComponent(track.id)}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { energy: number; tempo: number };
        features = { energy: data.energy ?? 0.5, tempo: data.tempo ?? 120 };
      } catch {
        features = { energy: 0.5, tempo: 120 };
      }
    };

    void loadFeatures();

    const timer = window.setInterval(() => {
      if (cancelled) {
        return;
      }
      const energy = features?.energy ?? 0.45;
      const tempo = features?.tempo ?? 120;
      setBeatData(energyToBeat(energy, tempo, Date.now()));
    }, 80);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isPlaying, setBeatData, track?.id]);
};
