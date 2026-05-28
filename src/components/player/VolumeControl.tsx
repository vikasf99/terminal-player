'use client';

import { useRef } from 'react';

import { usePlayerStore } from '@/stores/playerStore';

export function VolumeControl() {
  const volumePercent = usePlayerStore((s) => s.volumePercent);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const ref = useRef<HTMLDivElement>(null);

  const filled = Math.round(volumePercent / 10);
  const blocks = `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;

  return (
    <div
      ref={ref}
      onClick={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const x = event.clientX - rect.left;
        const pct = Math.round((x / rect.width) * 100);
        const next = Math.max(0, Math.min(100, pct));
        setVolume(next);
        void fetch('/api/spotify/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'volume', value: next }),
        });
      }}
      style={{
        marginTop: 12,
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span style={{ color: 'var(--gray-muted)' }}>vol </span>
      <span style={{ color: 'var(--white)' }}>[{blocks}] </span>
      <span style={{ color: 'var(--green-mid)' }}>{volumePercent}%</span>
    </div>
  );
}
