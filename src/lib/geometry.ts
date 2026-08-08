import type { CanvasElement } from '../store/slices/canvasSlice';

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function getElementBounds(el: CanvasElement): Bounds {
  if (el.type === 'freehand' && el.points && el.points.length > 0) {
    const xs = el.points.map((p) => p.x);
    const ys = el.points.map((p) => p.y);
    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    };
  }
  return {
    minX: el.x,
    minY: el.y,
    maxX: el.x + (el.width ?? 0),
    maxY: el.y + (el.height ?? 0),
  };
}

export function mergeBounds(bounds: Bounds[]): Bounds | null {
  if (bounds.length === 0) return null;
  return bounds.reduce<Bounds>(
    (acc, b) => ({
      minX: Math.min(acc.minX, b.minX),
      minY: Math.min(acc.minY, b.minY),
      maxX: Math.max(acc.maxX, b.maxX),
      maxY: Math.max(acc.maxY, b.maxY),
    }),
    bounds[0]
  );
}

export function hitTest(el: CanvasElement, worldX: number, worldY: number, padding = 8): boolean {
  const b = getElementBounds(el);
  return worldX >= b.minX - padding && worldX <= b.maxX + padding && worldY >= b.minY - padding && worldY <= b.maxY + padding;
}
