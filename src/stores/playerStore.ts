import { create } from 'zustand';

import { computeMatrixParams } from '@/lib/matrixParams';
import type { BeatData } from '@/types/beat';
import type { SpotifyTrack } from '@/types/spotify';

type PlayerState = {
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  progressMs: number;
  progressSyncedAt: number;
  volumePercent: number;
  beatIntensity: number;
  bassEnergy: number;
  bpm: number;
  isBeat: boolean;
  shuffle: boolean;
  repeat: boolean;
  playbackDeviceId: string | null;
  playbackDeviceName: string;
  sdkDeviceId: string | null;
  matrixSpeed: number;
  matrixBrightness: number;
  matrixDensity: number;
  getInterpolatedProgressMs: () => number;
  setTrack: (track: SpotifyTrack | null) => void;
  setPlayback: (isPlaying: boolean, progressMs: number) => void;
  setBeatData: (data: BeatData) => void;
  setVolume: (v: number) => void;
  setShuffle: (v: boolean) => void;
  setRepeat: (v: boolean) => void;
  setPlaybackDevice: (id: string | null, name: string) => void;
  setSdkDeviceId: (id: string | null) => void;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  progressMs: 0,
  progressSyncedAt: Date.now(),
  volumePercent: 100,
  beatIntensity: 0,
  bassEnergy: 0,
  bpm: 0,
  isBeat: false,
  shuffle: false,
  repeat: false,
  playbackDeviceId: null,
  playbackDeviceName: '',
  sdkDeviceId: null,
  matrixSpeed: 1.5,
  matrixBrightness: 0.5,
  matrixDensity: 0.3,

  getInterpolatedProgressMs: () => {
    const state = get();
    if (!state.isPlaying) {
      return state.progressMs;
    }
    const duration = state.currentTrack?.duration_ms ?? Number.POSITIVE_INFINITY;
    const elapsed = Date.now() - state.progressSyncedAt;
    return Math.min(duration, state.progressMs + elapsed);
  },

  setTrack: (track) => {
    set({ currentTrack: track });
  },

  setPlayback: (isPlaying, progressMs) => {
    set({ isPlaying, progressMs, progressSyncedAt: Date.now() });
  },

  setBeatData: (data) => {
    const current = get().beatIntensity;
    const bass = clamp01(data.bassEnergy);
    const target = clamp01(bass * 1.05 + (data.isBeat ? 0.45 : 0));
    const nextIntensity = data.isBeat
      ? clamp01(current * 0.3 + target * 0.7)
      : clamp01(current * 0.86 + target * 0.14);

    set({
      beatIntensity: nextIntensity,
      bassEnergy: bass,
      bpm: data.bpm,
      isBeat: data.isBeat,
      ...computeMatrixParams(nextIntensity, get().volumePercent, bass),
    });
  },

  setVolume: (v) => {
    const volumePercent = Math.max(0, Math.min(100, Math.round(v)));
    const energy = get().beatIntensity;
    set({
      volumePercent,
      ...computeMatrixParams(energy, volumePercent),
    });
  },

  setShuffle: (shuffle) => set({ shuffle }),

  setRepeat: (repeat) => set({ repeat }),

  setPlaybackDevice: (playbackDeviceId, playbackDeviceName) => {
    set({ playbackDeviceId, playbackDeviceName });
  },

  setSdkDeviceId: (sdkDeviceId) => set({ sdkDeviceId }),
}));
