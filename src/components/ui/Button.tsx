'use client';

import type { MouseEventHandler, ReactNode } from 'react';
import type { CSSProperties } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  fullWidth?: boolean;
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className,
  style,
  fullWidth = true,
}: ButtonProps) {
  const ghostStyles =
    variant === 'ghost'
      ? {
          borderColor: 'var(--gray-muted)',
          color: 'var(--green-mid)',
        }
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        width: fullWidth ? '100%' : 'auto',
        background: 'var(--bg-base)',
        border: '1px solid var(--cyan)',
        color: 'var(--green-bright)',
        fontFamily: 'var(--font-mono)',
        borderRadius: 0,
        padding: '8px 16px',
        boxShadow: 'none',
        textTransform: 'uppercase',
        transition: 'var(--t-instant)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...ghostStyles,
        ...style,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = 'var(--green-bright)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = variant === 'ghost' ? 'var(--gray-muted)' : 'var(--cyan)';
      }}
    >
      {children}
    </button>
  );
}
