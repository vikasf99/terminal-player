import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'privacy — terminal-playlist',
  description: 'Privacy policy for terminal-playlist',
};

const sections = [
  {
    title: 'what this app is',
    body: 'terminal-playlist is a personal web player that connects to your Spotify account to play music in the browser with a terminal-style interface. It is not affiliated with Spotify.',
  },
  {
    title: 'data we collect',
    body: 'We do not operate a user database. When you sign in, Spotify returns OAuth tokens that are stored in httpOnly cookies on your device for the session. We use those tokens only to call Spotify’s Web API and Web Playback SDK on your behalf (playback, playlists, volume, and related controls).',
  },
  {
    title: 'what we do not do',
    body: 'We do not sell your data. We do not store your Spotify password. We do not share tokens with third parties except Spotify’s services required to run the app.',
  },
  {
    title: 'third parties',
    body: 'Spotify handles authentication and streaming under Spotify’s own terms and privacy policy: https://www.spotify.com/legal/privacy-policy/',
  },
  {
    title: 'requirements',
    body: 'You need a Spotify Premium account to play full tracks in the browser via Spotify’s Web Playback SDK. Playlist track details are only available for playlists you own or collaborate on, per Spotify’s API rules.',
  },
  {
    title: 'retention',
    body: 'Session cookies expire according to Spotify token lifetime and browser settings. You can end access by logging out of the app session in your browser (clear site cookies) or revoking the app in your Spotify account settings.',
  },
  {
    title: 'contact',
    body: 'Questions about this policy: open an issue on the project repository linked from the app owner’s GitHub profile (terminal-player / terminal-playlist).',
  },
];

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--green-mid)',
        fontFamily: 'var(--font-mono)',
        padding: '24px 16px',
        lineHeight: 1.6,
      }}
    >
      <article style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 14,
            fontWeight: 400,
            color: 'var(--white)',
            textTransform: 'uppercase',
          }}
        >
          [PRIVACY POLICY]
        </h1>
        <p style={{ margin: '0 0 20px', fontSize: 11, color: 'var(--gray-muted)' }}>
          last updated: may 2026 · terminal-playlist
        </p>

        {sections.map((section) => (
          <section key={section.title} style={{ marginBottom: 20 }}>
            <h2
              style={{
                margin: '0 0 6px',
                fontSize: 12,
                fontWeight: 400,
                color: 'var(--green-bright)',
                textTransform: 'uppercase',
              }}
            >
              [{section.title}]
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--white)' }}>{section.body}</p>
          </section>
        ))}

        <p style={{ marginTop: 24, fontSize: 11 }}>
          <Link href="/login" style={{ color: 'var(--green-mid)' }}>
            ← back to login
          </Link>
        </p>
      </article>
    </main>
  );
}
