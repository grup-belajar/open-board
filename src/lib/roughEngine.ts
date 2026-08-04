import rough from 'roughjs';
import type { RoughCanvas } from 'roughjs/bin/canvas';

export function createRoughRenderer(canvas: HTMLCanvasElement): RoughCanvas {
  return rough.canvas(canvas);
}

export function drawFreehand(
  roughCanvas: RoughCanvas,
  points: { x: number; y: number }[],
  strokeColor: string,
  strokeWidth: number,
  roughness: number
): void {
  if (points.length === 0) return;
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  roughCanvas.path(path, {
    stroke: strokeColor,
    strokeWidth,
    roughness,
    fill: 'none',
  });
}