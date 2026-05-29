'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { flushVolumeToSpotify, sendVolumeToSpotify } from '@/lib/volumeApi';
import { usePlayerStore } from '@/stores/playerStore';

const SEGMENTS = 20;
const STEP = 5;

const volumeFromPointer = (clientX: number, rect: DOMRect): number => {
  const ratio = (clientX - rect.left) / rect.width;
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
};

type VolumeControlProps = {
  deviceId?: string | null;
};

export function VolumeControl({ deviceId = null }: VolumeControlProps) {
  const storeVolume = usePlayerStore((s) => s.volumePercent);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const ref = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [displayVolume, setDisplayVolume] = useState(storeVolume);

  useEffect(() => {
    if (!isDragging) {
      setDisplayVolume(storeVolume);
    }
  }, [storeVolume, isDragging]);

  const applyVolume = useCallback(
    (next: number, immediate = false): void => {
      const clamped = Math.max(0, Math.min(100, Math.round(next)));
      setDisplayVolume(clamped);
      setVolume(clamped);
      sendVolumeToSpotify(clamped, { immediate, deviceId });
    },
    [deviceId, setVolume],
  );

  const updateFromPointer = useCallback(
    (clientX: number, immediate = false): void => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0) {
        return;
      }
      applyVolume(volumeFromPointer(clientX, rect), immediate);
    },
    [applyVolume],
  );

  const endDrag = useCallback(
    (pointerId?: number): void => {
      if (!isDraggingRef.current) {
        return;
      }
      isDraggingRef.current = false;
      setIsDragging(false);
      if (pointerId !== undefined && ref.current?.hasPointerCapture(pointerId)) {
        ref.current.releasePointerCapture(pointerId);
      }
      flushVolumeToSpotify(usePlayerStore.getState().volumePercent, deviceId);
    },
    [deviceId],
  );

  useEffect(() => {
    const onMove = (event: PointerEvent): void => {
      if (!isDraggingRef.current) {
        return;
      }
      event.preventDefault();
      updateFromPointer(event.clientX);
    };

    const onUp = (event: PointerEvent): void => {
      endDrag(event.pointerId);
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [endDrag, updateFromPointer]);

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
          event.preventDefault();
          event.stopPropagation();
          isDraggingRef.current = true;
          setIsDragging(true);
          ref.current?.setPointerCapture(event.pointerId);
          updateFromPointer(event.clientX, true);
        }}
        onPointerUp={(event) => {
          endDrag(event.pointerId);
        }}
        onWheel={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const delta = event.deltaY < 0 ? STEP : -STEP;
          applyVolume(displayVolume + delta, true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            event.stopPropagation();
            applyVolume(displayVolume - STEP, true);
          }
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            event.stopPropagation();
            applyVolume(displayVolume + STEP, true);
          }
        }}
        style={{
          cursor: 'ew-resize',
          padding: '6px 0',
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
