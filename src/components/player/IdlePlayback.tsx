'use client';

import { Cursor } from '@/components/ui/Cursor';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function IdlePlayback() {
  return (
    <section style={{ fontFamily: 'var(--font-mono)', marginTop: 8 }}>
      <StatusBadge status="idle" />
      <div style={{ color: 'var(--gray-muted)', marginTop: 10, fontSize: 12, lineHeight: 1.6 }}>
        awaiting playback...
        <br />
        open spotify on any device to begin
      </div>
      <div style={{ marginTop: 10 }}>
        <Cursor />
      </div>
    </section>
  );
}
