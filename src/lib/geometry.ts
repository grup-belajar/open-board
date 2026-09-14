import type { CanvasElement } from '../store/slices/canvasSlice';

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const boundsCache = new WeakMap<CanvasElement, Bounds>();

export function getElementBounds(el: CanvasElement): Bounds {
  const cached = boundsCache.get(el);
  if (cached) return cached;

  let bounds: Bounds;

  if (el.type === 'freehand' && el.points && el.points.length > 0) {
    const first = el.points[0];
    bounds = {
      minX: first.x,
      minY: first.y,
      maxX: first.x,
      maxY: first.y,
    };
    for (let index = 1; index < el.points.length; index += 1) {
      const point = el.points[index];
      bounds.minX = Math.min(bounds.minX, point.x);
      bounds.minY = Math.min(bounds.minY, point.y);
      bounds.maxX = Math.max(bounds.maxX, point.x);
      bounds.maxY = Math.max(bounds.maxY, point.y);
    }
  } else if (el.type === 'text') {
    const lines = (el.text ?? '').split('\n');
    const fontSize = Math.max(12, el.strokeWidth * 6);
    const widestLine = Math.max(0, ...lines.map((line) => line.length));

    bounds = {
      minX: el.x,
      minY: el.y,
      maxX: el.x + widestLine * fontSize * 0.6,
      maxY: el.y + lines.length * (fontSize + 4),
    };
  } else {
    const maxX = el.x + (el.width ?? 0);
    const maxY = el.y + (el.height ?? 0);
    bounds = {
      minX: Math.min(el.x, maxX),
      minY: Math.min(el.y, maxY),
      maxX: Math.max(el.x, maxX),
      maxY: Math.max(el.y, maxY),
    };
  }

  boundsCache.set(el, bounds);
  return bounds;
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
