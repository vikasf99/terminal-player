export const CHAR_SET = 'ｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃ0123456789!@#$%^&*';

export const randomChar = (): string => {
  const index = Math.floor(Math.random() * CHAR_SET.length);
  return CHAR_SET[index] ?? '0';
};

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};
