import { dividerDotted, dividerSolid } from '@/lib/ascii';

type DividerProps = {
  variant?: 'solid' | 'dotted' | 'pipe';
  width?: number;
};

export function Divider({ variant = 'solid', width = 34 }: DividerProps) {
  const text = variant === 'dotted' ? dividerDotted(width) : variant === 'pipe' ? '│' : dividerSolid(width);
  return (
    <div
      style={{
        width: '100%',
        color: 'var(--gray-muted)',
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'pre',
        lineHeight: 1.2,
      }}
    >
      {text}
    </div>
  );
}
