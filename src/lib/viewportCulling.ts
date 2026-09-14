import type { CanvasElement } from '../store/slices/canvasSlice';
import type { Matrix2D } from './matrixMath';
import { getElementBounds } from './geometry';

/** [FE-03.5] Filter elemen agar hanya yang terlihat di viewport yang dirender -> target 60 FPS. */

// Buffer di luar tepi layar, supaya elemen tidak "muncul mendadak" (pop-in)
// saat panning cepat.
const CULL_MARGIN = 150;

/**
 * Mengembalikan hanya elemen yang bounding box-nya berpotongan dengan
 * viewport layar (setelah dikonversi lewat matrix pan/zoom saat ini),
 * ditambah margin toleransi.
 */
export function getVisibleElements(
  elements: CanvasElement[],
  viewport: { width: number; height: number },
  matrix: Matrix2D
): CanvasElement[] {
  return elements.filter((el) => {
    const b = getElementBounds(el);
    const left = b.minX * matrix.a + matrix.e;
    const top = b.minY * matrix.d + matrix.f;
    const right = b.maxX * matrix.a + matrix.e;
    const bottom = b.maxY * matrix.d + matrix.f;
    return (
      right  >= -CULL_MARGIN &&
      left   <= viewport.width  + CULL_MARGIN &&
      bottom >= -CULL_MARGIN &&
      top    <= viewport.height + CULL_MARGIN
    );
  });
}
