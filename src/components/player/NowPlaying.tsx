'use client';

import { useMemo } from 'react';

import { useTypewriter } from '@/hooks/useTypewriter';
import { usePlayerStore } from '@/stores/playerStore';
import { Divider } from '@/components/ui/Divider';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { IdlePlayback } from '@/components/player/IdlePlayback';
import { BufferingState } from '@/components/player/BufferingState';

type NowPlayingProps = {
  isBuffering?: boolean;
};

export function NowPlaying({ isBuffering = false }: NowPlayingProps) {
  const track = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const trackNameSource = useMemo(() => track?.name ?? '', [track?.id, track?.name]);
  const trackName = useTypewriter(trackNameSource || ' ', 20);
  const artist = track?.artists?.[0]?.name ?? 'unknown';
  const album = track?.album?.name ?? 'unknown';

  if (isBuffering) {
    return (
      <section style={{ fontFamily: 'var(--font-mono)' }}>
        <Divider variant="solid" />
        <BufferingState />
        <Divider variant="solid" />
      </section>
    );
  }

  if (!track) {
    return (
      <section style={{ fontFamily: 'var(--font-mono)' }}>
        <Divider variant="solid" />
        <IdlePlayback />
        <Divider variant="solid" />
      </section>
    );
  }

  return (
    <section style={{ fontFamily: 'var(--font-mono)' }}>
      <Divider variant="solid" />
      <div style={{ margin: '6px 0' }}>
        <StatusBadge status={isPlaying ? 'playing' : 'paused'} />
      </div>
      <div style={{ color: 'var(--white)', minHeight: '20px' }}>{trackName}</div>
      <div style={{ color: 'var(--green-mid)', marginTop: '2px' }}>~/{artist}/{album}</div>
      <Divider variant="solid" />
    </section>
  );
}
