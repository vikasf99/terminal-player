import type { CSSProperties, ReactNode } from 'react';

type PanelProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Panel({ children, className, style }: PanelProps) {
  return (
    <section
      className={className}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--cyan)',
        borderRadius: 0,
        padding: 'var(--space-md)',
        boxShadow: 'none',
        ...style,
      }}
    >
      {children}
    </section>
  );
}
