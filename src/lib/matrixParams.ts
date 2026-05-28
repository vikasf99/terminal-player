const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const computeMatrixParams = (energy: number, volumePercent: number): {
  matrixSpeed: number;
  matrixBrightness: number;
  matrixDensity: number;
} => {
  const e = clamp01(energy);
  const vol = clamp01(volumePercent / 100);
  const mix = 0.25 + vol * 0.75;

  return {
    matrixSpeed: 1 + e * 6 * mix,
    matrixBrightness: (0.28 + e * 0.72) * vol,
    matrixDensity: (0.08 + e * 0.62) * vol,
  };
};
