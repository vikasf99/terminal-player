'use client';

export function KeyboardShortcuts() {
  return (
    <p
      style={{
        marginTop: 10,
        marginBottom: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        lineHeight: 1.5,
        color: 'var(--gray-muted)',
        letterSpacing: '0.02em',
      }}
    >
      space play · ←→ seek · ↑↓ vol · s shuffle · r repeat · j/k enter queue · ` debug
    </p>
  );
}
