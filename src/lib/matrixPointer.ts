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

export const tickMatrixPointerSmooth = (): void => {
  const ease = 0.14;
  matrixPointer.smoothX += (matrixPointer.x - matrixPointer.smoothX) * ease;
  matrixPointer.smoothY += (matrixPointer.y - matrixPointer.smoothY) * ease;
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
  const dx = (nx - matrixPointer.smoothX) * aspect;
  const dy = ny - matrixPointer.smoothY;
  const dist = Math.hypot(dx, dy);

  return Math.exp(-dist * 5);
};
