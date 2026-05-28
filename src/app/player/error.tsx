'use client';

import { Button } from '@/components/ui/Button';

type PlayerErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PlayerError({ error, reset }: PlayerErrorProps) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--green-mid)',
        fontFamily: 'var(--font-mono)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
    >
      <section
        style={{
          maxWidth: 480,
          border: '1px solid var(--magenta)',
          background: 'var(--bg-surface)',
          padding: 16,
        }}
      >
        <p style={{ color: 'var(--magenta)', margin: '0 0 8px' }}>[ERROR] player crashed</p>
        <p style={{ color: 'var(--gray-muted)', fontSize: 12, margin: '0 0 12px', lineHeight: 1.6 }}>
          {error.message || 'unknown client error'}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="ghost" fullWidth={false} onClick={() => reset()}>
            [RETRY]
          </Button>
          <Button
            variant="ghost"
            fullWidth={false}
            onClick={() => {
              window.location.href = '/api/auth/start?reauth=1';
            }}
          >
            [RE-AUTHENTICATE]
          </Button>
        </div>
      </section>
    </main>
  );
}
