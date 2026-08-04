import type { CanvasElement } from '../store/slices/canvasSlice';
import type { Matrix2D } from './matrixMath';

export function getVisibleElements(
  elements: CanvasElement[],
  viewport: { width: number; height: number },
  matrix: Matrix2D
): CanvasElement[] {
  return elements.filter((el) => {
    const left = el.x * matrix.a + matrix.e;
    const top = el.y * matrix.d + matrix.f;
    const right = left + (el.width ?? 0) * matrix.a;
    const bottom = top + (el.height ?? 0) * matrix.d;
    return (
      right >= 0 &&
      left <= viewport.width &&
      bottom >= 0 &&
      top <= viewport.height
    );
  });
}