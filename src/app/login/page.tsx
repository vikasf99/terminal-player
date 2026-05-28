'use client';

import { useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import { shellPrompt, logo } from '@/lib/ascii';
import { useTypewriter } from '@/hooks/useTypewriter';

export default function LoginPage() {
  const promptSource = useMemo(() => `${shellPrompt}authenticate --spotify`, []);
  const prompt = useTypewriter(promptSource, 30);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--green-mid)',
        fontFamily: 'var(--font-mono)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '720px',
          border: '1px solid var(--cyan)',
          background: 'var(--bg-surface)',
          padding: '16px',
        }}
      >
        <pre
          style={{
            margin: 0,
            color: 'var(--green-bright)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.2,
          }}
        >
          {logo}
        </pre>

        <div style={{ marginTop: '16px', color: 'var(--green-dim)' }}>{prompt}</div>

        <div style={{ marginTop: '16px' }}>
          <Button
            onClick={() => {
              window.location.href = '/api/auth/start';
            }}
          >
            [AUTHENTICATE WITH SPOTIFY]
          </Button>
        </div>

        <div style={{ marginTop: '12px', color: 'var(--gray-muted)' }}>awaiting authentication...</div>
      </section>
    </main>
  );
}
