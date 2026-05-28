type MatrixPointerState = {
  x: number;
  y: number;
  smoothX: number;
  smoothY: number;
  active: boolean;
};

export const matrixPointer: MatrixPointerState = {
  x: 0.5,
  y: 0.5,
  smoothX: 0.5,
  smoothY: 0.5,
  active: false,
};

export const setMatrixPointer = (clientX: number, clientY: number): void => {
  if (typeof window === 'undefined') {
    return;
  }
  matrixPointer.x = clientX / window.innerWidth;
  matrixPointer.y = clientY / window.innerHeight;
  matrixPointer.active = true;
};

export const clearMatrixPointer = (): void => {
  matrixPointer.active = false;
};

/** Wider ellipse (horizontal stretch) for a broad wake. */
const POINTER_WAKE_WIDTH = 1.65;
/** Lower = larger radius (was 5). */
const POINTER_WAKE_SHARPNESS = 1.85;
const POINTER_WAKE_HALO = 0.95;

export const tickMatrixPointerSmooth = (): void => {
  const ease = 0.22;
  matrixPointer.smoothX += (matrixPointer.x - matrixPointer.smoothX) * ease;
  matrixPointer.smoothY += (matrixPointer.y - matrixPointer.smoothY) * ease;
};

export const getPointerLogicalPosition = (
  logicalWidth: number,
  logicalHeight: number,
): { x: number; y: number } | null => {
  if (!matrixPointer.active || logicalWidth <= 0 || logicalHeight <= 0) {
    return null;
  }
  return {
    x: matrixPointer.smoothX * logicalWidth,
    y: matrixPointer.smoothY * logicalHeight,
  };
};

export const getColumnPointerInfluence = (
  colX: number,
  colY: number,
  logicalWidth: number,
  logicalHeight: number,
): number => {
  if (!matrixPointer.active || logicalWidth <= 0 || logicalHeight <= 0) {
    return 0;
  }

  const nx = colX / logicalWidth;
  const ny = colY / logicalHeight;
  const aspect = logicalWidth / logicalHeight;
  const dx = ((nx - matrixPointer.smoothX) * aspect) / POINTER_WAKE_WIDTH;
  const dy = ny - matrixPointer.smoothY;
  const dist = Math.hypot(dx, dy);

  const core = Math.exp(-dist * POINTER_WAKE_SHARPNESS);
  const halo = Math.exp(-dist * POINTER_WAKE_HALO) * 0.55;
  return Math.min(1, core + halo);
};
