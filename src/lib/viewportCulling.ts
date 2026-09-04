import type { CanvasElement } from '../store/slices/canvasSlice';
import type { Matrix2D } from './matrixMath';
import { getElementBounds } from './geometry';

const CULL_MARGIN = 64;

export function getVisibleElements(
  elements: CanvasElement[],
  viewport: { width: number; height: number },
  matrix: Matrix2D
): CanvasElement[] {
  return elements.filter((el) => {
    const b = getElementBounds(el);
    const left   = b.minX * matrix.a + matrix.e;
    const top    = b.minY * matrix.d + matrix.f;
    const right  = b.maxX * matrix.a + matrix.e;
    const bottom = b.maxY * matrix.d + matrix.f;
    return (
      right  >= -CULL_MARGIN &&
      left   <= viewport.width  + CULL_MARGIN &&
      bottom >= -CULL_MARGIN &&
      top    <= viewport.height + CULL_MARGIN
    );
  });
}
