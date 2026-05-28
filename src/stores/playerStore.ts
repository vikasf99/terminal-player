import { create } from 'zustand';

import type { BeatData } from '@/types/beat';
import type { SpotifyTrack } from '@/types/spotify';

type PlayerState = {
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  progressMs: number;
  volumePercent: number;
  beatIntensity: number;
  bpm: number;
  isBeat: boolean;
  matrixSpeed: number;
  matrixBrightness: number;
  matrixDensity: number;
  setTrack: (track: SpotifyTrack | null) => void;
  setPlayback: (isPlaying: boolean, progressMs: number) => void;
  setBeatData: (data: BeatData) => void;
  setVolume: (v: number) => void;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  progressMs: 0,
  volumePercent: 100,
  beatIntensity: 0,
  bpm: 0,
  isBeat: false,
  matrixSpeed: 1.5,
  matrixBrightness: 0.5,
  matrixDensity: 0.3,

  setTrack: (track) => {
    set({ currentTrack: track });
  },

  setPlayback: (isPlaying, progressMs) => {
    set({ isPlaying, progressMs });
  },

  setBeatData: (data) => {
    const current = get().beatIntensity;
    const nextIntensity = data.isBeat
      ? clamp01(data.intensity)
      : clamp01(Math.max(current, data.intensity) - 0.05);

    set({
      beatIntensity: nextIntensity,
      bpm: data.bpm,
      isBeat: data.isBeat,
      matrixSpeed: 1.5 + nextIntensity * 4.5,
      matrixBrightness: 0.5 + nextIntensity * 0.5,
      matrixDensity: 0.3 + nextIntensity * 0.6,
    });
  },

  setVolume: (v) => {
    set({ volumePercent: Math.max(0, Math.min(100, v)) });
  },
}));
