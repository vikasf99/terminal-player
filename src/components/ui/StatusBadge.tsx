'use client';

import { useEffect, useState } from 'react';

type Status = 'playing' | 'paused' | 'buffering' | 'idle';

type StatusBadgeProps = {
  status: Status;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (status !== 'buffering') {
      setDots('');
      return;
    }

    const timer = window.setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`));
    }, 160);

    return () => window.clearInterval(timer);
  }, [status]);

  const map: Record<Status, { text: string; color: string; glow?: string }> = {
    playing: { text: '[NOW PLAYING]', color: 'var(--green-bright)', glow: 'var(--glow-green)' },
    paused: { text: '[PAUSED]', color: 'var(--gray-muted)' },
    buffering: { text: `[BUFFERING${dots}]`, color: 'var(--yellow)' },
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
