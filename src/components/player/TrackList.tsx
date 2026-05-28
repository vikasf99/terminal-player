'use client';

import { useEffect, useRef } from 'react';

import type { SpotifyTrack } from '@/types/spotify';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { TrackRow } from '@/components/player/TrackRow';

type TrackListProps = {
  title: string;
  tracks: SpotifyTrack[];
  currentTrackId?: string;
  selectedIndex: number;
  isLoading?: boolean;
  error?: string | null;
  needsReauth?: boolean;
  playlistTotal?: number;
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
  needsReauth = false,
  playlistTotal = 0,
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
      {error ? (
        <div style={{ margin: '8px 0' }}>
          <p style={{ color: 'var(--magenta)', fontSize: 12, margin: '0 0 8px' }}>[ERROR] {error}</p>
          {needsReauth ? (
            <Button
              variant="ghost"
              fullWidth={false}
              onClick={() => {
                window.location.href = '/api/auth/start?reauth=1';
              }}
            >
              [RE-AUTHENTICATE]
            </Button>
          ) : null}
        </div>
      ) : null}
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
            <p style={{ color: 'var(--gray-muted)', fontSize: 12, margin: '8px 0' }}>
              {playlistTotal > 0
                ? `spotify reports ${playlistTotal} tracks but none are playable here`
                : 'no tracks in this playlist'}
            </p>
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
