import { create } from 'zustand';

import type { BeatData } from '@/types/beat';
import type { SpotifyTrack } from '@/types/spotify';

type PlayerState = {
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  progressMs: number;
  volumePercent: number;
  beatIntensity: number;
  bassEnergy: number;
  bpm: number;
  isBeat: boolean;
  shuffle: boolean;
  repeat: boolean;
  matrixSpeed: number;
  matrixBrightness: number;
  matrixDensity: number;
  setTrack: (track: SpotifyTrack | null) => void;
  setPlayback: (isPlaying: boolean, progressMs: number) => void;
  setBeatData: (data: BeatData) => void;
  setVolume: (v: number) => void;
  setShuffle: (v: boolean) => void;
  setRepeat: (v: boolean) => void;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  progressMs: 0,
  volumePercent: 100,
  beatIntensity: 0,
  bassEnergy: 0,
  bpm: 0,
  isBeat: false,
  shuffle: false,
  repeat: false,
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
    const hitIntensity = clamp01(data.intensity * (data.isBeat ? 1.25 : 1));
    const nextIntensity = data.isBeat
      ? clamp01(Math.max(current, hitIntensity))
      : clamp01(Math.max(current, data.bassEnergy, hitIntensity) - 0.03);

    const energy = clamp01(Math.max(nextIntensity, data.bassEnergy * 1.1));

    set({
      beatIntensity: nextIntensity,
      bassEnergy: data.bassEnergy,
      bpm: data.bpm,
      isBeat: data.isBeat,
      matrixSpeed: 1 + energy * 10,
      matrixBrightness: 0.4 + energy * 1,
      matrixDensity: 0.15 + energy * 0.9,
    });
  },

  setVolume: (v) => {
    set({ volumePercent: Math.max(0, Math.min(100, v)) });
  },

  setShuffle: (shuffle) => set({ shuffle }),

  setRepeat: (repeat) => set({ repeat }),
}));
