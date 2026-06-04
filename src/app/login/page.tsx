'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import { AccessRequestLink } from '@/components/player/AccessRequestLink';
import { Button } from '@/components/ui/Button';
import { AuthErrorState } from '@/components/player/AuthErrorState';
import { shellPrompt, logo } from '@/lib/ascii';
import { useTypewriter } from '@/hooks/useTypewriter';

const privacyPolicyHref =
  process.env.NEXT_PUBLIC_BASE_URL != null && process.env.NEXT_PUBLIC_BASE_URL.length > 0
    ? `${process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')}/privacy`
    : '/privacy';

function LoginContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const error = searchParams.get('error');
  const showAuthError = reason === 'session_expired' || error === 'auth_failed';

  const promptSource = useMemo(() => `${shellPrompt}authenticate --spotify`, []);
  const prompt = useTypewriter(promptSource, 30);

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '720px',
        border: '1px solid var(--cyan)',
        background: 'var(--bg-surface)',
        padding: '16px',
        borderRadius: 0,
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

      {showAuthError ? (
        <div style={{ marginTop: '16px' }}>
          <AuthErrorState compact />
        </div>
      ) : null}

      <div style={{ marginTop: '16px' }}>
        <Button
          onClick={() => {
            window.location.href = '/api/auth/start';
          }}
        >
          [AUTHENTICATE WITH SPOTIFY]
        </Button>
      </div>

      <p style={{ margin: '12px 0 0', color: 'var(--gray-muted)', fontSize: 11 }}>
        spotify premium required
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 11 }}>
        <a href={privacyPolicyHref} style={{ color: 'var(--green-mid)' }}>
          privacy
        </a>
        <span style={{ color: 'var(--gray-muted)' }}> · </span>
        <AccessRequestLink compact />
      </p>
    </section>
  );
}

export default function LoginPage() {
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
      <Suspense
        fallback={
          <section style={{ color: 'var(--gray-muted)', fontFamily: 'var(--font-mono)' }}>loading...</section>
        }
      >
        <LoginContent />
      </Suspense>
    </main>
  );
}
