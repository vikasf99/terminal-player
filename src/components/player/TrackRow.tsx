'use client';

import type { SpotifyTrack } from '@/types/spotify';

type TrackRowProps = {
  index: number;
  track: SpotifyTrack;
  isActive: boolean;
  onClick?: () => void;
};

const formatMs = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
};

export function TrackRow({ index, track, isActive, onClick }: TrackRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        border: 'none',
        borderBottom: '1px solid var(--gray-muted)',
        borderLeft: isActive ? '2px solid var(--green-bright)' : '2px solid transparent',
        background: 'transparent',
        textAlign: 'left',
        padding: '8px 8px 8px 10px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--white)',
        borderRadius: 0,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--green-bright)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--white)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ color: 'var(--gray-muted)' }}>{String(index + 1).padStart(2, '0')}</span>
        <span style={{ flex: 1, color: 'var(--white)', textShadow: isActive ? 'var(--glow-green)' : 'none' }}>{track.name}</span>
        <span style={{ color: 'var(--gray-muted)' }}>{formatMs(track.duration_ms)}</span>
      </div>
      <div style={{ marginTop: 2, color: 'var(--green-mid)' }}>{track.artists.map((a) => a.name).join(', ')}</div>
    </button>
  );
}
