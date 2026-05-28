'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { CHAR_SET } from '@/lib/audio';
import { clearMatrixPointer, setMatrixPointer } from '@/lib/matrixPointer';
import { useMatrixRain } from '@/components/matrix/useMatrixRain';
import type { MatrixConfig } from '@/types/matrix';

const isSlowDevice = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const cores = navigator.hardwareConcurrency ?? 8;
  return cores < 4;
};

const columnScaleForViewport = (width: number): number => {
  if (width < 768) {
    return 0.5;
  }
  return 1;
};

export function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [columnScale, setColumnScale] = useState(1);

  const initialConfig = useMemo<MatrixConfig>(() => {
    const slow = isSlowDevice();
    return {
      speed: 1.5,
      brightness: 0.7,
      density: slow ? 0.28 : 0.45,
      fontSize: 14,
      charSet: CHAR_SET,
      columnScale: 1,
    };
  }, []);

  const { start, stop, updateConfig } = useMatrixRain(canvasRef, initialConfig);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(window.innerWidth);
      const height = Math.floor(window.innerHeight);
      const scale = columnScaleForViewport(width);
      setColumnScale(scale);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const slow = isSlowDevice();
      updateConfig({
        columnScale: scale,
        density: slow ? 0.28 : 0.45,
      });
      stop();
      start();
    };

    let debounceTimer: number | null = null;
    const onResize = (): void => {
      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(resize, 120);
    };

    resize();
    window.addEventListener('resize', onResize);

    return () => {
      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer);
      }
      window.removeEventListener('resize', onResize);
      stop();
    };
  }, [start, stop, updateConfig]);

  useEffect(() => {
    const onMove = (event: MouseEvent): void => {
      setMatrixPointer(event.clientX, event.clientY);
    };

    const onTouch = (event: TouchEvent): void => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      setMatrixPointer(touch.clientX, touch.clientY);
    };

    const onLeave = (): void => {
      clearMatrixPointer();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchend', onLeave);
    window.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onLeave);
      window.removeEventListener('mouseleave', onLeave);
      clearMatrixPointer();
    };
  }, []);

  useEffect(() => {
    const onVisibility = (): void => {
      if (document.hidden) {
        stop();
        return;
      }
      updateConfig({ columnScale });
      start();
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [columnScale, start, stop, updateConfig]);

  useEffect(() => {
    return () => {
      stop();
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [stop]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
}
