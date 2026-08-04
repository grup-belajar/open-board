export interface Matrix2D {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export const IDENTITY_MATRIX: Matrix2D = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

export function createMatrix(scale: number, tx: number, ty: number): Matrix2D {
  return { a: scale, b: 0, c: 0, d: scale, e: tx, f: ty };
}

export function screenToWorld(
  mx: number,
  my: number,
  matrix: Matrix2D
): { x: number; y: number } {
  return {
    x: (mx - matrix.e) / matrix.a,
    y: (my - matrix.f) / matrix.d,
  };
}

export function worldToScreen(
  wx: number,
  wy: number,
  matrix: Matrix2D
): { x: number; y: number } {
  return {
    x: wx * matrix.a + matrix.e,
    y: wy * matrix.d + matrix.f,
  };
}