'use client';

import { Button } from '@/components/ui/Button';
import type { SpotifyPlaylist } from '@/types/spotify';

type PlaylistPickerProps = {
  playlists: SpotifyPlaylist[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  needsReauth?: boolean;
  onSelect: (playlist: SpotifyPlaylist) => void;
};

export function PlaylistPicker({
  playlists,
  selectedId,
  isLoading,
  error,
  needsReauth = false,
  onSelect,
}: PlaylistPickerProps) {
  if (isLoading) {
    return <p style={{ color: 'var(--gray-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>loading playlists...</p>;
  }

  if (error) {
    return (
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        <p style={{ color: 'var(--magenta)', margin: '0 0 8px' }}>[ERROR] {error}</p>
        {needsReauth ? (
          <>
            <p style={{ color: 'var(--gray-muted)', margin: '0 0 8px', lineHeight: 1.5 }}>
              sign in again with spotify premium. if this persists, your account may not have access while the app is in spotify development mode.
            </p>
            <Button
              variant="ghost"
              fullWidth={false}
              onClick={() => {
                window.location.href = '/api/auth/start?reauth=1';
              }}
            >
              [RE-AUTHENTICATE]
            </Button>
          </>
        ) : null}
      </div>
    );
  }

  if (playlists.length === 0) {
    return <p style={{ color: 'var(--gray-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>no playlists found</p>;
  }

  return (
    <div
      role="listbox"
      aria-label="playlists"
      style={{ maxHeight: 140, overflowY: 'auto', borderBottom: '1px solid var(--gray-muted)' }}
    >
      {playlists.map((playlist) => {
        const isSelected = playlist.id === selectedId;
        return (
          <button
            key={playlist.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(playlist)}
            style={{
              width: '100%',
              border: 'none',
              borderLeft: isSelected ? '2px solid var(--green-bright)' : '2px solid transparent',
              background: 'transparent',
              textAlign: 'left',
              padding: '6px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: isSelected ? 'var(--green-bright)' : 'var(--white)',
              textShadow: isSelected ? 'var(--glow-green)' : 'none',
              cursor: 'pointer',
              borderRadius: 0,
            }}
          >
            <span style={{ color: 'var(--gray-muted)', marginRight: 6 }}>{isSelected ? '>' : ' '}</span>
            {playlist.name}
            <span style={{ color: 'var(--gray-muted)', marginLeft: 6 }}>({playlist.tracks?.total ?? 0})</span>
          </button>
        );
      })}
    </div>
  );
}
