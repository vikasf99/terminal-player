const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const computeMatrixParams = (
  energy: number,
  volumePercent: number,
  bassEnergy = energy,
): {
  matrixSpeed: number;
  matrixBrightness: number;
  matrixDensity: number;
} => {
  const e = clamp01(energy);
  const b = clamp01(bassEnergy);
  const drive = clamp01(e * 0.35 + b * 0.65);
  const vol = clamp01(volumePercent / 100);
  const mix = 0.25 + vol * 0.75;

  return {
    matrixSpeed: 1 + drive * 7 * mix,
    matrixBrightness: (0.22 + drive * 0.78) * vol,
    matrixDensity: (0.06 + drive * 0.7) * vol,
  };
};
