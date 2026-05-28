'use client';

import { MatrixCanvas } from '@/components/matrix/MatrixCanvas';
import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { NowPlaying } from '@/components/player/NowPlaying';
import { ProgressBar } from '@/components/player/ProgressBar';
import { Controls } from '@/components/player/Controls';
import { VolumeControl } from '@/components/player/VolumeControl';
import { TrackList } from '@/components/player/TrackList';
import { Panel } from '@/components/ui/Panel';
import { usePlayerStore } from '@/stores/playerStore';

export function PlayerShell() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = currentTrack ? [currentTrack] : [];

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      <MatrixCanvas />

      <div style={{ position: 'absolute', zIndex: 10, bottom: 32, left: 32, width: 380 }}>
        <TerminalWindow title="terminal-playlist ~ player">
          <NowPlaying />
          <ProgressBar />
          <Controls />
          <VolumeControl />
        </TerminalWindow>
      </div>

      <div style={{ position: 'absolute', zIndex: 10, bottom: 32, right: 32, width: 320 }}>
        <Panel>
          <TrackList tracks={queue} currentTrackId={currentTrack?.id} />
        </Panel>
      </div>
    </main>
  );
}
