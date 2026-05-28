'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useBeatDetection } from '@/components/matrix/useBeatDetection';
import { PlayerShell } from '@/components/player/PlayerShell';
import { Shell } from '@/components/layout/Shell';
export default function PlayerPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  useBeatDetection(audioRef);

  useEffect(() => {
    const run = async (): Promise<void> => {
      const attempts = 8;
      for (let i = 0; i < attempts; i += 1) {
        const response = await fetch('/api/spotify/token', { cache: 'no-store' });
        if (response.ok) {
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
      router.replace('/login');
    };
    void run();
  }, [router]);

  return (
    <Shell>
      <PlayerShell />
      <audio ref={audioRef} style={{ display: 'none' }} aria-hidden="true" />
    </Shell>
  );
}
