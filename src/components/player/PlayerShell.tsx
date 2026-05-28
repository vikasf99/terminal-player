'use client';

import { useCallback, useEffect, useState } from 'react';

import { MatrixCanvas } from '@/components/matrix/MatrixCanvas';
import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { NowPlaying } from '@/components/player/NowPlaying';
import { ProgressBar } from '@/components/player/ProgressBar';
import { Controls } from '@/components/player/Controls';
import { VolumeControl } from '@/components/player/VolumeControl';
import { TrackList } from '@/components/player/TrackList';
import { PlaylistPicker } from '@/components/player/PlaylistPicker';
import {
  KeyboardShortcutsHint,
  KeyboardShortcutsPanel,
} from '@/components/player/KeyboardShortcuts';
import { DebugOverlay } from '@/components/player/DebugOverlay';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { usePlaylists } from '@/hooks/usePlaylists';
import { usePlaylistTracks } from '@/hooks/usePlaylistTracks';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { usePlayerKeyboard } from '@/hooks/usePlayerKeyboard';
import { useViewport } from '@/hooks/useViewport';
import { playPlaylistTrack } from '@/lib/playback';
import { useSpotifyBeatSync } from '@/hooks/useSpotifyBeatSync';
import { usePlayerStore } from '@/stores/playerStore';
import type { SpotifyPlaylist } from '@/types/spotify';

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
};

export function PlayerShell() {
  const viewport = useViewport();
  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  const { deviceId, isReady } = useSpotifyPlayer();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const { playlists, isLoading: playlistsLoading, error: playlistsError, needsReauth } = usePlaylists();

  useSpotifyBeatSync(currentTrack, isPlaying);

  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [queueOpen, setQueueOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const playlistId = selectedPlaylist?.id ?? null;
  const { tracks, isLoading: tracksLoading, error: tracksError, needsReauth: tracksNeedReauth } =
    usePlaylistTracks(playlistId);

  const isBuffering = tracksLoading;

  usePlayerKeyboard({
    onToggleDebug: () => setDebugOpen((v) => !v),
    onToggleShortcuts: () => setShortcutsOpen((v) => !v),
  });

  useEffect(() => {
    if (!selectedPlaylist && playlists.length > 0) {
      setSelectedPlaylist(playlists[0]);
    }
  }, [playlists, selectedPlaylist]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [playlistId]);

  useEffect(() => {
    if (!currentTrack?.id || tracks.length === 0) {
      return;
    }
    const playingIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    if (playingIndex >= 0) {
      setSelectedIndex(playingIndex);
    }
  }, [currentTrack?.id, tracks]);

  const playAtIndex = useCallback(
    async (index: number): Promise<void> => {
      if (!playlistId || !tracks[index]) {
        return;
      }
      await playPlaylistTrack({
        playlistId,
        offset: index,
        deviceId: isReady ? deviceId : null,
      });
    },
    [deviceId, isReady, playlistId, tracks],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (isEditableTarget(event.target) || tracks.length === 0) {
        return;
      }

      if (event.key === 'j') {
        event.preventDefault();
        setSelectedIndex((i) => Math.min(tracks.length - 1, i + 1));
        return;
      }

      if (event.key === 'k') {
        event.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        void playAtIndex(selectedIndex);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playAtIndex, selectedIndex, tracks.length]);

  const playerWidth = isMobile ? '100%' : isTablet ? 340 : 380;
  const libraryWidth = isTablet ? 300 : 360;

  const playerPanelStyle = isMobile
    ? {
        position: 'fixed' as const,
        zIndex: 10,
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
      }
    : {
        position: 'absolute' as const,
        zIndex: 10,
        bottom: 32,
        left: 32,
        width: playerWidth,
      };

  const libraryPanelStyle = isMobile
    ? {
        position: 'fixed' as const,
        zIndex: 11,
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxHeight: queueOpen ? '70vh' : 0,
        overflow: 'hidden' as const,
        pointerEvents: queueOpen ? ('auto' as const) : ('none' as const),
        opacity: queueOpen ? 1 : 0,
        transition: 'opacity 0.05s linear',
      }
    : {
        position: 'absolute' as const,
        zIndex: 10,
        bottom: 32,
        right: 32,
        width: libraryWidth,
      };

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      <MatrixCanvas />
      <DebugOverlay visible={debugOpen} />
      <KeyboardShortcutsPanel open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <div style={playerPanelStyle}>
        <TerminalWindow title="terminal-playlist ~ player" className={isMobile ? 'terminal-mobile' : undefined}>
          {isMobile ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <Button variant="ghost" fullWidth={false} onClick={() => setQueueOpen((v) => !v)}>
                [QUEUE]
              </Button>
            </div>
          ) : null}
          <NowPlaying isBuffering={isBuffering} />
          <ProgressBar />
          <Controls />
          <VolumeControl />
          <KeyboardShortcutsHint onOpen={() => setShortcutsOpen(true)} />
        </TerminalWindow>
      </div>

      {!isMobile ? (
        <div style={libraryPanelStyle}>
          <Panel>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--white)', fontSize: 12, marginBottom: 6 }}>
              [LIBRARY]
            </div>
            <PlaylistPicker
              playlists={playlists}
              selectedId={selectedPlaylist?.id ?? null}
              isLoading={playlistsLoading}
              error={playlistsError}
              needsReauth={needsReauth}
              onSelect={(playlist) => setSelectedPlaylist(playlist)}
            />
            <Divider variant="dotted" width={24} />
            <TrackList
              title={selectedPlaylist?.name?.toUpperCase() ?? 'TRACKS'}
              tracks={tracks}
              currentTrackId={currentTrack?.id}
              selectedIndex={selectedIndex}
              isLoading={tracksLoading}
              error={tracksError}
              needsReauth={tracksNeedReauth}
              onSelectIndex={setSelectedIndex}
              onPlayIndex={(index) => {
                void playAtIndex(index);
              }}
            />
          </Panel>
        </div>
      ) : null}

      {isMobile && queueOpen ? (
        <div style={libraryPanelStyle}>
          <Panel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--white)', fontSize: 12 }}>[LIBRARY]</span>
              <Button variant="ghost" fullWidth={false} onClick={() => setQueueOpen(false)}>
                [CLOSE]
              </Button>
            </div>
            <PlaylistPicker
              playlists={playlists}
              selectedId={selectedPlaylist?.id ?? null}
              isLoading={playlistsLoading}
              error={playlistsError}
              needsReauth={needsReauth}
              onSelect={(playlist) => setSelectedPlaylist(playlist)}
            />
            <Divider variant="dotted" width={24} />
            <TrackList
              title={selectedPlaylist?.name?.toUpperCase() ?? 'TRACKS'}
              tracks={tracks}
              currentTrackId={currentTrack?.id}
              selectedIndex={selectedIndex}
              isLoading={tracksLoading}
              error={tracksError}
              needsReauth={tracksNeedReauth}
              onSelectIndex={setSelectedIndex}
              onPlayIndex={(index) => {
                void playAtIndex(index);
              }}
            />
          </Panel>
        </div>
      ) : null}
    </main>
  );
}
