'use client';

import { useEffect } from 'react';

import { usePlayerStore } from '@/stores/playerStore';

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
};

const sendControl = async (action: string, value?: string | number | boolean): Promise<void> => {
  await fetch('/api/spotify/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, value }),
  });
};

type UsePlayerKeyboardOptions = {
  enabled?: boolean;
  onToggleDebug?: () => void;
};

export const usePlayerKeyboard = ({ enabled = true, onToggleDebug }: UsePlayerKeyboardOptions = {}): void => {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlayback = usePlayerStore((s) => s.setPlayback);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const setShuffle = usePlayerStore((s) => s.setShuffle);
  const setRepeat = usePlayerStore((s) => s.setRepeat);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === '`') {
        event.preventDefault();
        onToggleDebug?.();
        return;
      }

      if (event.key === ' ') {
        event.preventDefault();
        const nextPlaying = !isPlaying;
        setPlayback(nextPlaying, usePlayerStore.getState().progressMs);
        void sendControl(nextPlaying ? 'play' : 'pause');
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const next = Math.min(
          usePlayerStore.getState().currentTrack?.duration_ms ?? 0,
          usePlayerStore.getState().progressMs + 10_000,
        );
        setPlayback(isPlaying, next);
        void sendControl('seek', next);
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const next = Math.max(0, usePlayerStore.getState().progressMs - 10_000);
        setPlayback(isPlaying, next);
        void sendControl('seek', next);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const next = Math.min(100, usePlayerStore.getState().volumePercent + 10);
        setVolume(next);
        void sendControl('volume', next);
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = Math.max(0, usePlayerStore.getState().volumePercent - 10);
        setVolume(next);
        void sendControl('volume', next);
        return;
      }

      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        const next = !shuffle;
        setShuffle(next);
        void sendControl('shuffle', next);
        return;
      }

      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        const next = !repeat;
        setRepeat(next);
        void sendControl('repeat', next);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    enabled,
    isPlaying,
    onToggleDebug,
    repeat,
    setPlayback,
    setRepeat,
    setShuffle,
    setVolume,
    shuffle,
  ]);
};
