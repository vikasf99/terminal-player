'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { randomChar } from '@/lib/audio';
import {
  getColumnPointerInfluence,
  getPointerLogicalPosition,
  tickMatrixPointerSmooth,
} from '@/lib/matrixPointer';
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
    tickMatrixPointerSmooth();

    const pointerPos = getPointerLogicalPosition(logicalWidth, logicalHeight);
    if (pointerPos) {
      const wakeRadius = Math.min(logicalWidth, logicalHeight) * 0.28;
      const grad = ctx.createRadialGradient(
        pointerPos.x,
        pointerPos.y,
        0,
        pointerPos.x,
        pointerPos.y,
        wakeRadius,
      );
      grad.addColorStop(0, 'rgba(0, 255, 136, 0.22)');
      grad.addColorStop(0.35, 'rgba(0, 255, 159, 0.08)');
      grad.addColorStop(0.7, 'rgba(0, 255, 136, 0.02)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(
        pointerPos.x - wakeRadius,
        pointerPos.y - wakeRadius,
        wakeRadius * 2,
        wakeRadius * 2,
      );
    }

    const bassDrive = usePlayerStore.getState().bassEnergy;
    const burstDrive = Math.max(energy, bassDrive * 0.9);

    if (isBeatRef.current && columns.length > 0 && burstDrive > 0.06) {
      const burstCount = 2 + Math.floor(burstDrive * 8);
      for (let i = 0; i < burstCount; i += 1) {
        const idx = Math.floor(Math.random() * columns.length);
        const burst = columns[idx];
        burst.active = true;
        burst.y = -Math.random() * currentConfig.fontSize * 4;
        burst.length = randomTrailLength() + Math.floor(burstDrive * 14);
        burst.speed = Math.max(0.4, currentConfig.speed * (1.3 + burstDrive * 1.4));
        burst.chars = [];
      }
      isBeatRef.current = false;
    }

    for (let i = 0; i < columns.length; i += 1) {
      const column = columns[i];
      const pointerPull = getColumnPointerInfluence(column.x, column.y, logicalWidth, logicalHeight);

      if (pointerPull > 0.12) {
        column.active = true;
      }

      if (!column.active) {
        const spawnChance = currentConfig.density * (0.02 + energy * 0.04 + pointerPull * 1.4);
        if (Math.random() < spawnChance) {
          column.active = true;
          column.y =
            pointerPull > 0.2
              ? column.y - currentConfig.fontSize * (3 + pointerPull * 6)
              : -Math.random() * logicalHeight * 0.2;
          column.length = randomTrailLength() + Math.floor(pointerPull * 14);
          column.speed = Math.max(0.4, currentConfig.speed * (1.4 + pointerPull * 2));
        }
        continue;
      }

      const nextChar = currentConfig.charSet[Math.floor(Math.random() * currentConfig.charSet.length)] ?? randomChar();
      column.chars.unshift(nextChar);
      if (column.chars.length > column.length) {
        column.chars.length = column.length;
      }

      if (pointerPull > 0.2) {
        column.length = Math.min(48, column.length + 1 + Math.floor(pointerPull * 2));
        column.speed = Math.min(
          currentConfig.speed * 4,
          column.speed + currentConfig.speed * 0.04 * pointerPull,
        );
      }

      if (pointerPull > 0.35) {
        column.y -= currentConfig.fontSize * pointerPull * 0.85;
      }

      const headY = column.y;
      const headBrightness = Math.min(1, currentConfig.brightness * (1 + energy * 0.35 + pointerPull * 1.1));
      const headGlow = 12 + energy * 28 + pointerPull * 72;

      ctx.shadowBlur = headGlow;
      ctx.shadowColor = '#00FF88';
      ctx.fillStyle = colorWithBrightness(0, 255, 136, headBrightness, 1);
      ctx.fillText(column.chars[0] ?? randomChar(), column.x, headY);

      ctx.shadowBlur = 0;
      for (let j = 1; j < column.chars.length; j += 1) {
        const alpha = Math.max(0.08, 1 - j / column.length);
        const trailBrightness = Math.min(1, currentConfig.brightness * (1 + pointerPull * 0.65));
        ctx.fillStyle = colorWithBrightness(0, 255, 159, trailBrightness, alpha);
        ctx.fillText(column.chars[j] ?? randomChar(), column.x, headY - j * currentConfig.fontSize);
      }

      const speedMul = (1 + energy * 1.2) * (1 + pointerPull * 3.2);
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
