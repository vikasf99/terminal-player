'use client';

import { Button } from '@/components/ui/Button';
import { sendSpotifyControl } from '@/lib/spotifyControl';
import { usePlayerStore } from '@/stores/playerStore';

export function Controls() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlayback = usePlayerStore((s) => s.setPlayback);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const setShuffle = usePlayerStore((s) => s.setShuffle);
  const setRepeat = usePlayerStore((s) => s.setRepeat);

  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="ghost" fullWidth={false} onClick={() => void sendSpotifyControl({ action: 'previous' })}>
        ⏮ prev
      </Button>
      <Button
        variant="ghost"
        fullWidth={false}
        onClick={() => {
          setPlayback(!isPlaying, usePlayerStore.getState().progressMs);
          void sendSpotifyControl({ action: isPlaying ? 'pause' : 'play' });
        }}
      >
        <span style={{ fontSize: 16, textShadow: isPlaying ? 'var(--glow-green)' : 'none' }}>
          {isPlaying ? '■ pause' : '▶ play'}
        </span>
      </Button>
      <Button variant="ghost" fullWidth={false} onClick={() => void sendSpotifyControl({ action: 'next' })}>
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
          void sendSpotifyControl({ action: 'repeat', value: next });
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
          void sendSpotifyControl({ action: 'shuffle', value: next });
        }}
      >
        ⇌ shuffle
      </Button>
    </div>
  );
}
