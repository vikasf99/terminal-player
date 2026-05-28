export interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
  active: boolean;
}

export interface MatrixConfig {
  speed: number;
  brightness: number;
  density: number;
  charSet: string;
  fontSize: number;
}
