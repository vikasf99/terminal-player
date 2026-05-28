'use client';

import { usePlayerStore } from '@/stores/playerStore';

type DebugOverlayProps = {
  visible: boolean;
};

const bar = (value: number): string => {
  const filled = Math.round(Math.max(0, Math.min(1, value)) * 10);
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;
};

export function DebugOverlay({ visible }: DebugOverlayProps) {
  const beatIntensity = usePlayerStore((s) => s.beatIntensity);
  const bpm = usePlayerStore((s) => s.bpm);
  const bassEnergy = usePlayerStore((s) => s.bassEnergy);
  const matrixSpeed = usePlayerStore((s) => s.matrixSpeed);
  const matrixDensity = usePlayerStore((s) => s.matrixDensity);

  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 30,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--green-mid)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--gray-muted)',
        padding: '10px 12px',
        lineHeight: 1.7,
        borderRadius: 0,
      }}
    >
      <div style={{ color: 'var(--white)', marginBottom: 4 }}>[DEBUG]</div>
      <div>
        beat intensity: {beatIntensity.toFixed(2)} {bar(beatIntensity)}
      </div>
      <div>bpm estimate: {bpm || '—'}</div>
      <div>
        bass energy: {bassEnergy.toFixed(2)} {bar(bassEnergy)}
      </div>
      <div>matrix speed: {matrixSpeed.toFixed(1)}</div>
      <div>matrix density: {matrixDensity.toFixed(2)}</div>
    </div>
  );
}
