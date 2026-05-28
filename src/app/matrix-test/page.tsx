'use client';

import { useState } from 'react';

import { MatrixCanvas } from '@/components/matrix/MatrixCanvas';
import { usePlayerStore } from '@/stores/playerStore';

export default function MatrixTestPage() {
  const [beatIntensity, setBeatIntensity] = useState(0.3);
  const setBeatData = usePlayerStore((state) => state.setBeatData);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--green-mid)',
        fontFamily: 'var(--font-mono)',
        position: 'relative',
        zIndex: 10,
        padding: '16px',
      }}
    >
      <MatrixCanvas />

      <section
        style={{
          position: 'relative',
          zIndex: 12,
          maxWidth: '680px',
          border: '1px solid var(--cyan)',
          background: 'rgba(0, 0, 0, 0.65)',
          padding: '16px',
        }}
      >
        <div style={{ color: 'var(--green-bright)', textTransform: 'uppercase' }}>[MATRIX TEST]</div>
        <div style={{ marginTop: '12px', color: 'var(--gray-muted)' }}>beat intensity: {beatIntensity.toFixed(2)}</div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={beatIntensity}
          onChange={(event) => {
            const value = Number(event.target.value);
            setBeatIntensity(value);
            setBeatData({ isBeat: true, intensity: value, bpm: 120 });
          }}
          style={{
            width: '100%',
            marginTop: '12px',
            accentColor: '#00FF88',
          }}
        />
        <div style={{ marginTop: '12px', color: 'var(--green-dim)' }}>
          slider at 0 = dim drift, slider at 1 = bright dense rain
        </div>
      </section>
    </main>
  );
}
