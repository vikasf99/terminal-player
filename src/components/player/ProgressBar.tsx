'use client';

import { useEffect, useMemo, useState } from 'react';

import { usePlayerStore } from '@/stores/playerStore';

const formatMs = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
};

export function ProgressBar() {
  const progressMs = usePlayerStore((s) => s.progressMs);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const durationMs = usePlayerStore((s) => s.currentTrack?.duration_ms ?? 0);
  const setPlayback = usePlayerStore((s) => s.setPlayback);

  useEffect(() => {
    if (!isPlaying || !durationMs) {
      return;
    }
    const timer = window.setInterval(() => {
      setPlayback(true, Math.min(durationMs, usePlayerStore.getState().progressMs + 250));
    }, 250);
    return () => window.clearInterval(timer);
  }, [durationMs, isPlaying, setPlayback]);

  const pct = useMemo(() => {
    if (!durationMs) return 0;
    return Math.max(0, Math.min(100, (progressMs / durationMs) * 100));
  }, [progressMs, durationMs]);

  return (
    <section style={{ marginTop: 12, fontFamily: 'var(--font-mono)' }}>
      <div style={{ width: '100%', height: 2, background: 'var(--gray-muted)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green-bright)' }} />
      </div>
      <div style={{ marginTop: 6, color: 'var(--gray-muted)', fontSize: 12 }}>
        {formatMs(progressMs)} / {formatMs(durationMs)}
      </div>
    </section>
  );
}
