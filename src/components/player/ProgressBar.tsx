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
  const getInterpolatedProgressMs = usePlayerStore((s) => s.getInterpolatedProgressMs);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const durationMs = usePlayerStore((s) => s.currentTrack?.duration_ms ?? 0);
  const [displayMs, setDisplayMs] = useState(0);

  useEffect(() => {
    const tick = (): void => {
      setDisplayMs(getInterpolatedProgressMs());
    };
    tick();
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [getInterpolatedProgressMs, isPlaying]);

  const pct = useMemo(() => {
    if (!durationMs) return 0;
    return Math.max(0, Math.min(100, (displayMs / durationMs) * 100));
  }, [displayMs, durationMs]);

  return (
    <section style={{ marginTop: 12, fontFamily: 'var(--font-mono)' }}>
      <div style={{ width: '100%', height: 2, background: 'var(--gray-muted)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green-bright)' }} />
      </div>
      <div style={{ marginTop: 6, color: 'var(--gray-muted)', fontSize: 12 }}>
        {formatMs(displayMs)} / {formatMs(durationMs)}
      </div>
    </section>
  );
}
