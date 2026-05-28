'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { sendVolumeToSpotify } from '@/lib/volumeApi';
import { usePlayerStore } from '@/stores/playerStore';

const SEGMENTS = 20;

const volumeFromPointer = (clientX: number, rect: DOMRect): number => {
  const ratio = (clientX - rect.left) / rect.width;
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
};

export function VolumeControl() {
  const storeVolume = usePlayerStore((s) => s.volumePercent);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const ref = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [displayVolume, setDisplayVolume] = useState(storeVolume);

  useEffect(() => {
    if (!draggingRef.current) {
      setDisplayVolume(storeVolume);
    }
  }, [storeVolume]);

  const applyVolume = useCallback(
    (next: number): void => {
      setDisplayVolume(next);
      setVolume(next);
      sendVolumeToSpotify(next);
    },
    [setVolume],
  );

  const updateFromEvent = useCallback(
    (clientX: number): void => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      applyVolume(volumeFromPointer(clientX, rect));
    },
    [applyVolume],
  );

  useEffect(() => {
    const onMove = (event: PointerEvent): void => {
      if (!draggingRef.current) {
        return;
      }
      updateFromEvent(event.clientX);
    };

    const onUp = (): void => {
      draggingRef.current = false;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [updateFromEvent]);

  const filled = Math.round((displayVolume / 100) * SEGMENTS);
  const blocks = `${'█'.repeat(filled)}${'░'.repeat(SEGMENTS - filled)}`;

  return (
    <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', userSelect: 'none' }}>
      <div
        ref={ref}
        role="slider"
        aria-label="volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={displayVolume}
        tabIndex={0}
        onPointerDown={(event) => {
          draggingRef.current = true;
          ref.current?.setPointerCapture(event.pointerId);
          updateFromEvent(event.clientX);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            applyVolume(Math.max(0, displayVolume - 5));
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            applyVolume(Math.min(100, displayVolume + 5));
          }
        }}
        style={{
          cursor: 'ew-resize',
          padding: '4px 0',
          touchAction: 'none',
        }}
      >
        <span style={{ color: 'var(--gray-muted)' }}>vol </span>
        <span style={{ color: 'var(--white)', letterSpacing: '0.02em' }}>[{blocks}] </span>
        <span style={{ color: 'var(--green-mid)' }}>{displayVolume}%</span>
      </div>
    </div>
  );
}
