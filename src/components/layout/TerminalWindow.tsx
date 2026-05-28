import type { ReactNode } from 'react';

type TerminalWindowProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function TerminalWindow({ title, children, className }: TerminalWindowProps) {
  return (
    <section
      className={className}
      style={{
        border: '1px solid var(--gray-muted)',
        background: 'var(--bg-surface)',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderBottom: '1px solid var(--gray-muted)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--gray-muted)',
          fontSize: '12px',
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F', display: 'inline-block' }} />
        <span style={{ marginLeft: 8 }}>{title}</span>
      </header>
      <div style={{ padding: '12px' }}>{children}</div>
    </section>
  );
}
