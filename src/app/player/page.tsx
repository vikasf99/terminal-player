'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PlayerShell } from '@/components/player/PlayerShell';
import { PlayerBoundary } from '@/components/player/PlayerBoundary';
import { Shell } from '@/components/layout/Shell';
import { useSpotifyPlaybackSync } from '@/hooks/useSpotifyPlaybackSync';

function PlayerContent() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);

  useSpotifyPlaybackSync();

  useEffect(() => {
    const run = async (): Promise<void> => {
      const attempts = 8;
      for (let i = 0; i < attempts; i += 1) {
        const response = await fetch('/api/spotify/token', { cache: 'no-store' });
        if (response.ok) {
          setAuthReady(true);
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
      router.replace('/login');
    };
    void run();
  }, [router]);

  if (!authReady) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--bg-base)',
          color: 'var(--gray-muted)',
          fontFamily: 'var(--font-mono)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        loading session...
      </main>
    );
  }

  return <PlayerShell />;
}

export default function PlayerPage() {
  return (
    <Shell>
      <PlayerBoundary>
        <PlayerContent />
      </PlayerBoundary>
    </Shell>
  );
}
