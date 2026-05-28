'use client';

import { useEffect, useMemo, useRef } from 'react';

import { CHAR_SET } from '@/lib/audio';
import { useMatrixRain } from '@/components/matrix/useMatrixRain';
import type { MatrixConfig } from '@/types/matrix';

const BASE_CONFIG: MatrixConfig = {
  speed: 1.5,
  brightness: 0.7,
  density: 0.4,
  fontSize: 14,
  charSet: CHAR_SET,
};

export function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initialConfig = useMemo(() => BASE_CONFIG, []);
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
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      stop();
      start();
    };

    let debounceTimer: number | null = null;
    const onResize = (): void => {
      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(() => {
        resize();
      }, 120);
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
  }, [start, stop]);

  useEffect(() => {
    updateConfig(initialConfig);
  }, [initialConfig, updateConfig]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
