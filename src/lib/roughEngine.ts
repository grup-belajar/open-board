import rough from 'roughjs';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import type { CanvasElement } from '../store/slices/canvasSlice';

export type RoughOptions = {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughness: number;
};

export function createRoughRenderer(canvas: HTMLCanvasElement): RoughCanvas {
  return rough.canvas(canvas);
}

function toRoughOptions(options: RoughOptions) {
  return {
    stroke: options.strokeColor,
    fill: options.fillColor === 'transparent' ? undefined : options.fillColor,
    fillStyle: 'hachure' as const,
    strokeWidth: options.strokeWidth,
    roughness: options.roughness,
  };
}

export function drawFreehand(
  roughCanvas: RoughCanvas,
  points: { x: number; y: number }[],
  options: RoughOptions
): void {
  if (points.length === 0) return;
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  roughCanvas.path(path, toRoughOptions(options));
}

export function drawRectangle(
  roughCanvas: RoughCanvas,
  x: number,
  y: number,
  width: number,
  height: number,
  options: RoughOptions
): void {
  roughCanvas.rectangle(x, y, width, height, toRoughOptions(options));
}

export function drawEllipse(
  roughCanvas: RoughCanvas,
  x: number,
  y: number,
  width: number,
  height: number,
  options: RoughOptions
): void {
  roughCanvas.ellipse(x + width / 2, y + height / 2, width, height, toRoughOptions(options));
}

export function drawLine(
  roughCanvas: RoughCanvas,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: RoughOptions
): void {
  roughCanvas.line(x1, y1, x2, y2, toRoughOptions(options));
}

export function drawElement(roughCanvas: RoughCanvas, el: CanvasElement): void {
  const options: RoughOptions = {
    strokeColor: el.strokeColor,
    fillColor: el.fillColor,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
  };

  switch (el.type) {
    case 'freehand':
      if (el.points) drawFreehand(roughCanvas, el.points, options);
      break;
    case 'rectangle':
      drawRectangle(roughCanvas, el.x, el.y, el.width ?? 0, el.height ?? 0, options);
      break;
    case 'ellipse':
      drawEllipse(roughCanvas, el.x, el.y, el.width ?? 0, el.height ?? 0, options);
      break;
    case 'line':
      drawLine(roughCanvas, el.x, el.y, (el.width ?? 0) + el.x, (el.height ?? 0) + el.y, options);
      break;
    default:
      break;
  }
}
