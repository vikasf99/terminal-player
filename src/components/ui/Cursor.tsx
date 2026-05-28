'use client';

import { useEffect, useState } from 'react';

type CursorProps = {
  prefix?: string;
};

export function Cursor({ prefix = '> ' }: CursorProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisible((v) => !v);
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--green-bright)' }}>
      {prefix}
      <span style={{ opacity: visible ? 1 : 0 }}>_</span>
    </span>
  );
}
