'use client';

type AuthErrorStateProps = {
  compact?: boolean;
};

export function AuthErrorState({ compact = false }: AuthErrorStateProps) {
  return (
    <section
      style={{
        fontFamily: 'var(--font-mono)',
        marginTop: compact ? 0 : 8,
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      <div style={{ color: 'var(--magenta)' }}>[ERROR] authentication failed</div>
      <div style={{ color: 'var(--gray-muted)', marginTop: 6 }}>
        your session may have expired.
        <br />
        sign in again with a spotify premium account at{' '}
        <a href="/login" style={{ color: 'var(--green-mid)' }}>
          /login
        </a>
      </div>
    </section>
  );
}
