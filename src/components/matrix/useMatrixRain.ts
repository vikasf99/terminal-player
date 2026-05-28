'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { randomChar } from '@/lib/audio';
import { usePlayerStore } from '@/stores/playerStore';
import type { MatrixColumn, MatrixConfig } from '@/types/matrix';

type UseMatrixRainReturn = {
  start: () => void;
  stop: () => void;
  updateConfig: (partial: Partial<MatrixConfig>) => void;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const colorWithBrightness = (r: number, g: number, b: number, brightness: number, alpha = 1): string => {
  const mul = clamp01(brightness);
  const rr = Math.round(r * mul);
  const gg = Math.round(g * mul);
  const bb = Math.round(b * mul);
  return `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
};

const randomTrailLength = (): number => 8 + Math.floor(Math.random() * 18);

const getLogicalSize = (canvas: HTMLCanvasElement): { width: number; height: number } => {
  const dpr = window.devicePixelRatio || 1;
  return {
    width: canvas.width / dpr,
    height: canvas.height / dpr,
  };
};

const makeColumn = (
  x: number,
  fontSize: number,
  speed: number,
  density: number,
  height: number,
): MatrixColumn => {
  const speedVariance = speed * 0.2;
  const randomSpeed = speed + (Math.random() * 2 - 1) * speedVariance;
  return {
    x,
    y: Math.random() * height,
    speed: Math.max(0.2, randomSpeed),
    chars: [],
    length: randomTrailLength(),
    active: Math.random() < clamp01(density),
  };
};

export const useMatrixRain = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  config: MatrixConfig,
): UseMatrixRainReturn => {
  const rafRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const columnsRef = useRef<MatrixColumn[]>([]);
  const configRef = useRef<MatrixConfig>(config);
  const isBeatRef = useRef(false);
  const energyRef = useRef(0);

  const initializeColumns = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const { width: logicalWidth, height: logicalHeight } = getLogicalSize(canvas);
    const columnScale = configRef.current.columnScale ?? 1;
    const fullColumns = Math.max(1, Math.floor(logicalWidth / configRef.current.fontSize));
    const columnCount = Math.max(1, Math.floor(fullColumns * columnScale));
    const xStep = logicalWidth / columnCount;
    const cols: MatrixColumn[] = [];
    for (let i = 0; i < columnCount; i += 1) {
      cols.push(
        makeColumn(
          i * xStep,
          configRef.current.fontSize,
          configRef.current.speed,
          configRef.current.density,
          logicalHeight,
        ),
      );
    }
    columnsRef.current = cols;
  }, [canvasRef]);

  const renderFrame = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const currentConfig = configRef.current;
    const { width: logicalWidth, height: logicalHeight } = getLogicalSize(canvas);
    const columnCount = columnsRef.current.length;
    const xStep = columnCount > 0 ? logicalWidth / columnCount : logicalWidth;

    const energy = energyRef.current;
    const fadeAlpha = 0.04 + energy * 0.1;
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
    ctx.font = `${currentConfig.fontSize}px var(--font-mono), monospace`;
    ctx.textBaseline = 'top';

    const columns = columnsRef.current;
    if (isBeatRef.current && columns.length > 0 && energy > 0.08) {
      const burstCount = 2 + Math.floor(energy * 6);
      for (let i = 0; i < burstCount; i += 1) {
        const idx = Math.floor(Math.random() * columns.length);
        const burst = columns[idx];
        burst.active = true;
        burst.y = -Math.random() * currentConfig.fontSize * 4;
        burst.length = randomTrailLength() + Math.floor(energy * 10);
        burst.speed = Math.max(0.4, currentConfig.speed * (1.2 + energy));
        burst.chars = [];
      }
      isBeatRef.current = false;
    }

    for (let i = 0; i < columns.length; i += 1) {
      const column = columns[i];
      if (!column.active) {
        if (Math.random() < currentConfig.density * (0.02 + energy * 0.04)) {
          column.active = true;
          column.y = -Math.random() * logicalHeight * 0.2;
        }
        continue;
      }

      const nextChar = currentConfig.charSet[Math.floor(Math.random() * currentConfig.charSet.length)] ?? randomChar();
      column.chars.unshift(nextChar);
      if (column.chars.length > column.length) {
        column.chars.length = column.length;
      }

      const headY = column.y;

      const headGlow = 12 + energy * 28;
      ctx.shadowBlur = headGlow;
      ctx.shadowColor = '#00FF88';
      ctx.fillStyle = colorWithBrightness(0, 255, 136, Math.min(1, currentConfig.brightness * (1 + energy * 0.35)), 1);
      ctx.fillText(column.chars[0] ?? randomChar(), column.x, headY);

      ctx.shadowBlur = 0;
      for (let j = 1; j < column.chars.length; j += 1) {
        const alpha = Math.max(0.08, 1 - j / column.length);
        ctx.fillStyle = colorWithBrightness(0, 255, 159, currentConfig.brightness, alpha);
        ctx.fillText(column.chars[j] ?? randomChar(), column.x, headY - j * currentConfig.fontSize);
      }

      const speedMul = 1 + energy * 1.2;
      column.y += column.speed * speedMul;

      if (column.y > logicalHeight + column.length * currentConfig.fontSize) {
        column.y = -Math.random() * currentConfig.fontSize * 8;
        column.x = i * xStep + Math.floor((Math.random() - 0.5) * currentConfig.fontSize);
        column.length = randomTrailLength();
        column.speed = Math.max(
          0.2,
          currentConfig.speed + (Math.random() * 2 - 1) * currentConfig.speed * 0.2,
        );
        column.chars = [];
        column.active = Math.random() < currentConfig.density;
      }
    }

    if (isRunningRef.current) {
      rafRef.current = window.requestAnimationFrame(renderFrame);
    }
  }, [canvasRef]);

  const stop = useCallback((): void => {
    isRunningRef.current = false;
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const { width, height } = getLogicalSize(canvas);
        ctx.clearRect(0, 0, width, height);
      }
    }
    columnsRef.current = [];
  }, [canvasRef]);

  const start = useCallback((): void => {
    if (isRunningRef.current) {
      return;
    }
    initializeColumns();
    isRunningRef.current = true;
    rafRef.current = window.requestAnimationFrame(renderFrame);
  }, [initializeColumns, renderFrame]);

  const updateConfig = useCallback((partial: Partial<MatrixConfig>): void => {
    configRef.current = {
      ...configRef.current,
      ...partial,
      brightness:
        partial.brightness !== undefined ? clamp01(partial.brightness) : clamp01(configRef.current.brightness),
      density: partial.density !== undefined ? clamp01(partial.density) : clamp01(configRef.current.density),
    };
  }, []);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const slowDensityScale =
      typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 8) < 4 ? 0.5 : 1;

    const unsubscribe = usePlayerStore.subscribe((state) => {
      energyRef.current = state.beatIntensity;
      const vol = state.volumePercent / 100;
      const densityFloor = (0.06 + vol * 0.22) * slowDensityScale;
      configRef.current = {
        ...configRef.current,
        speed: Math.max(0.5, state.matrixSpeed),
        brightness: Math.max(0, state.matrixBrightness),
        density: Math.max(densityFloor, state.matrixDensity * slowDensityScale),
      };
      if (state.isBeat) {
        isBeatRef.current = true;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop, updateConfig };
};
