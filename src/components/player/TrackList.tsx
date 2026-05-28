'use client';

import { useEffect, useRef } from 'react';

import type { SpotifyTrack } from '@/types/spotify';
import { Divider } from '@/components/ui/Divider';
import { TrackRow } from '@/components/player/TrackRow';

type TrackListProps = {
  title: string;
  tracks: SpotifyTrack[];
  currentTrackId?: string;
  selectedIndex: number;
  isLoading?: boolean;
  error?: string | null;
  onSelectIndex: (index: number) => void;
  onPlayIndex: (index: number) => void;
};

export function TrackList({
  title,
  tracks,
  currentTrackId,
  selectedIndex,
  isLoading,
  error,
  onSelectIndex,
  onPlayIndex,
}: TrackListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = listRef.current;
    if (!container) {
      return;
    }
    const row = container.querySelector<HTMLElement>(`[data-track-index="${selectedIndex}"]`);
    row?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <section style={{ fontFamily: 'var(--font-mono)' }}>
      <div style={{ color: 'var(--white)' }}>[{title}]</div>
      <Divider variant="solid" width={18} />
      {isLoading ? (
        <p style={{ color: 'var(--gray-muted)', fontSize: 12, margin: '8px 0' }}>loading tracks...</p>
      ) : null}
      {error ? <p style={{ color: 'var(--green-mid)', fontSize: 12, margin: '8px 0' }}>{error}</p> : null}
      {!isLoading && !error ? (
        <div
          ref={listRef}
          style={{
            maxHeight: '42vh',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {tracks.length === 0 ? (
            <p style={{ color: 'var(--gray-muted)', fontSize: 12, margin: '8px 0' }}>no tracks</p>
          ) : (
            tracks.map((track, index) => (
              <div key={track.id ?? `${index}-${track.name}`} data-track-index={index}>
                <TrackRow
                  index={index}
                  track={track}
                  isActive={track.id === currentTrackId}
                  isSelected={index === selectedIndex}
                  onClick={() => {
                    onSelectIndex(index);
                    onPlayIndex(index);
                  }}
                />
              </div>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
