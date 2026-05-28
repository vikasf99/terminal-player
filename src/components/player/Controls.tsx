'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { usePlayerStore } from '@/stores/playerStore';

export function Controls() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlayback = usePlayerStore((s) => s.setPlayback);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const send = async (action: string, value?: string | number | boolean): Promise<void> => {
    await fetch('/api/spotify/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, value }),
    });
  };

  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="ghost" fullWidth={false} onClick={() => void send('previous')}>
        ⏮ prev
      </Button>
      <Button
        variant="ghost"
        fullWidth={false}
        onClick={() => {
          setPlayback(!isPlaying, usePlayerStore.getState().progressMs);
          void send(isPlaying ? 'pause' : 'play');
        }}
      >
        <span style={{ fontSize: 16, textShadow: isPlaying ? 'var(--glow-green)' : 'none' }}>{isPlaying ? '■ pause' : '▶ play'}</span>
      </Button>
      <Button variant="ghost" fullWidth={false} onClick={() => void send('next')}>
        ⏭ next
      </Button>
      <Button
        variant="ghost"
        fullWidth={false}
        style={{
          borderColor: repeat ? 'var(--green-bright)' : 'var(--gray-muted)',
          textShadow: repeat ? 'var(--glow-green)' : 'none',
        }}
        onClick={() => {
          const next = !repeat;
          setRepeat(next);
          void send('repeat', next);
        }}
      >
        ↺ repeat
      </Button>
      <Button
        variant="ghost"
        fullWidth={false}
        style={{
          borderColor: shuffle ? 'var(--green-bright)' : 'var(--gray-muted)',
          textShadow: shuffle ? 'var(--glow-green)' : 'none',
        }}
        onClick={() => {
          const next = !shuffle;
          setShuffle(next);
          void send('shuffle', next);
        }}
      >
        ⇌ shuffle
      </Button>
    </div>
  );
}
