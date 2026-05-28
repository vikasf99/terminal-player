'use client';

import type { SpotifyTrack } from '@/types/spotify';
import { Divider } from '@/components/ui/Divider';
import { TrackRow } from '@/components/player/TrackRow';

type TrackListProps = {
  tracks: SpotifyTrack[];
  currentTrackId?: string;
};

export function TrackList({ tracks, currentTrackId }: TrackListProps) {
  return (
    <section style={{ fontFamily: 'var(--font-mono)' }}>
      <div style={{ color: 'var(--white)' }}>[QUEUE] {tracks.length} tracks</div>
      <Divider variant="solid" width={18} />
      <div
        style={{
          maxHeight: '40vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {tracks.map((track, index) => (
          <TrackRow key={track.id ?? `${index}-${track.name}`} index={index} track={track} isActive={track.id === currentTrackId} />
        ))}
      </div>
    </section>
  );
}
