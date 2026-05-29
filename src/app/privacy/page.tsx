import type { Metadata } from 'next';

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
    body: 'Spotify handles authentication and streaming under Spotify’s own terms and privacy policy.',
    link: { href: 'https://www.spotify.com/legal/privacy-policy/', label: 'spotify privacy policy' },
  },
  {
    title: 'requirements',
    body: 'You need a Spotify Premium account to play full tracks in the browser via Spotify’s Web Playback SDK. Playlist track details are only available for playlists you own or collaborate on, per Spotify’s API rules.',
  },
  {
    title: 'retention',
    body: 'Session cookies expire according to Spotify token lifetime and browser settings. You can end access by clearing site cookies or revoking the app in your Spotify account settings.',
  },
  {
    title: 'contact',
    body: 'Questions about this policy: open an issue on the project repository (terminal-player / terminal-playlist) on GitHub.',
  },
] as const;

const pageStyle = {
  minHeight: '100vh',
  background: '#000000',
  color: '#00cc6a',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  padding: '24px 16px',
  lineHeight: 1.6,
} as const;

export default function PrivacyPage() {
  return (
    <main style={pageStyle}>
      <article style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 16,
            fontWeight: 400,
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          [PRIVACY POLICY]
        </h1>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#888888' }}>
          last updated: may 2026 · terminal-playlist
        </p>

        {sections.map((section) => (
          <section key={section.title} style={{ marginBottom: 20 }}>
            <h2
              style={{
                margin: '0 0 6px',
                fontSize: 13,
                fontWeight: 400,
                color: '#00ff88',
                textTransform: 'uppercase',
              }}
            >
              [{section.title}]
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#e0e0e0' }}>{section.body}</p>
            {'link' in section && section.link ? (
              <p style={{ margin: '8px 0 0', fontSize: 13 }}>
                <a href={section.link.href} style={{ color: '#00ff88' }}>
                  {section.link.label}
                </a>
              </p>
            ) : null}
          </section>
        ))}

        <p style={{ marginTop: 24, fontSize: 12 }}>
          <a href="/login" style={{ color: '#00cc6a' }}>
            ← back to login
          </a>
        </p>
      </article>
    </main>
  );
}
