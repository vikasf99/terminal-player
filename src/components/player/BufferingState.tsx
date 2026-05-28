'use client';

import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/ui/StatusBadge';

const DOT_CYCLE = ['', '.', '..', '...', '..', '.'];

export function BufferingState() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrame((f) => (f + 1) % DOT_CYCLE.length);
    }, 200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section style={{ fontFamily: 'var(--font-mono)', marginTop: 8 }}>
      <StatusBadge status="buffering" />
      <div style={{ color: 'var(--gray-muted)', marginTop: 10, fontSize: 12 }}>
        loading track data{DOT_CYCLE[frame]}
      </div>
    </section>
  );
}
