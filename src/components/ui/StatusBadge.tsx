'use client';

type Status = 'playing' | 'paused' | 'buffering' | 'idle';

type StatusBadgeProps = {
  status: Status;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<Status, { text: string; color: string; glow?: string }> = {
    playing: { text: '[PLAYING]', color: 'var(--green-bright)', glow: 'var(--glow-green)' },
    paused: { text: '[PAUSED]', color: 'var(--gray-muted)' },
    buffering: { text: '[BUFFERING]', color: 'var(--yellow)' },
    idle: { text: '[IDLE]', color: 'var(--gray-muted)' },
  };

  const current = map[status];

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        color: current.color,
        textShadow: current.glow ?? 'none',
      }}
    >
      {current.text}
    </span>
  );
}
