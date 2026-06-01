'use client';

import { AccessRequestLink } from '@/components/player/AccessRequestLink';
import { Button } from '@/components/ui/Button';
import type { SpotifyAccessReason } from '@/types/spotifyAccess';

type SpotifyAccessNoticeProps = {
  reason: SpotifyAccessReason;
};

export function SpotifyAccessNotice({ reason }: SpotifyAccessNoticeProps) {
  if (reason === 'dev_mode_allowlist') {
    return (
      <div style={{ marginTop: 8 }}>
        <p style={{ color: 'var(--gray-muted)', margin: '0 0 8px', lineHeight: 1.55, fontSize: 12 }}>
          this app is in <span style={{ color: 'var(--white)' }}>spotify development mode</span>. only invited
          spotify accounts can load playlists and tracks (max 5 users).
        </p>
        <p style={{ color: 'var(--gray-muted)', margin: '0 0 8px', lineHeight: 1.55, fontSize: 12 }}>
          ask the app owner to add your <span style={{ color: 'var(--white)' }}>spotify account email</span> in the
          spotify developer dashboard → users and access, then sign in again here.
        </p>
        <p style={{ color: 'var(--gray-muted)', margin: '0 0 10px', lineHeight: 1.55, fontSize: 12 }}>
          you also need <span style={{ color: 'var(--white)' }}>spotify premium</span> for in-browser playback.
        </p>
        <Button
          variant="ghost"
          fullWidth={false}
          onClick={() => {
            window.location.href = '/api/auth/start?reauth=1';
          }}
        >
          [SIGN IN AGAIN AFTER INVITE]
        </Button>
        <AccessRequestLink prefix="need an invite?" />
      </div>
    );
  }

  if (reason === 'session_expired') {
    return (
      <div style={{ marginTop: 8 }}>
        <p style={{ color: 'var(--gray-muted)', margin: '0 0 10px', lineHeight: 1.55, fontSize: 12 }}>
          your session expired. sign in again with spotify premium.
        </p>
        <Button
          variant="ghost"
          fullWidth={false}
          onClick={() => {
            window.location.href = '/api/auth/start?reauth=1';
          }}
        >
          [SIGN IN AGAIN]
        </Button>
      </div>
    );
  }

  return (
    <p style={{ color: 'var(--gray-muted)', margin: '8px 0 0', lineHeight: 1.55, fontSize: 12 }}>
      try signing in again. if this continues, contact the app owner.
    </p>
  );
}
