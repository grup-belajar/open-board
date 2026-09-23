import rough from 'roughjs';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import type { Drawable } from 'roughjs/bin/core';
import type { CanvasElement } from '../store/slices/canvasSlice';
import { getTextFontSize } from './geometry';

export type RoughOptions = {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughness: number;
};

const drawableCache = new WeakMap<RoughCanvas, WeakMap<CanvasElement, Drawable>>();

export function createRoughRenderer(canvas: HTMLCanvasElement): RoughCanvas {
  return rough.canvas(canvas);
}

function toRoughOptions(options: RoughOptions) {
  return {
    stroke: options.strokeColor,
    fill: options.fillColor === 'transparent' ? undefined : options.fillColor,
    fillStyle: options.roughness === 0 ? 'solid' as const : 'hachure' as const,
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

export function drawElement(
  roughCanvas: RoughCanvas,
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  shouldCache = true
): void {
  if (el.type === 'text') {
    drawText(ctx, el);
    return;
  }

  if (el.type === 'sticky') {
    drawSticky(roughCanvas, ctx, el, shouldCache);
    return;
  }

  const drawable = shouldCache ? getDrawable(roughCanvas, el) : createDrawable(roughCanvas, el);
  if (drawable) roughCanvas.draw(drawable);
}

function getDrawable(roughCanvas: RoughCanvas, el: CanvasElement): Drawable | null {
  let elementCache = drawableCache.get(roughCanvas);
  if (!elementCache) {
    elementCache = new WeakMap<CanvasElement, Drawable>();
    drawableCache.set(roughCanvas, elementCache);
  }

  const cached = elementCache.get(el);
  if (cached) return cached;

  const drawable = createDrawable(roughCanvas, el);
  if (drawable) elementCache.set(el, drawable);
  return drawable;
}

function createDrawable(roughCanvas: RoughCanvas, el: CanvasElement): Drawable | null {
  const options: RoughOptions = {
    strokeColor: el.strokeColor,
    fillColor: el.type === 'sticky' ? 'transparent' : el.fillColor,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
  };

  const generator = roughCanvas.generator;
  let drawable: Drawable | null = null;

  switch (el.type) {
    case 'freehand':
      if (el.points) {
        const path = el.points
          .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
          .join(' ');
        drawable = generator.path(path, toRoughOptions(options));
      }
      break;
    case 'rectangle':
      drawable = generator.rectangle(el.x, el.y, el.width ?? 0, el.height ?? 0, toRoughOptions(options));
      break;
    case 'ellipse':
      drawable = generator.ellipse(
        el.x + (el.width ?? 0) / 2,
        el.y + (el.height ?? 0) / 2,
        el.width ?? 0,
        el.height ?? 0,
        toRoughOptions(options)
      );
      break;
    case 'line':
      drawable = generator.line(
        el.x,
        el.y,
        (el.width ?? 0) + el.x,
        (el.height ?? 0) + el.y,
        toRoughOptions(options)
      );
      break;
    case 'sticky':
      drawable = generator.rectangle(el.x, el.y, el.width ?? 160, el.height ?? 120, toRoughOptions(options));
      break;
    default:
      return null;
  }

  return drawable;
}

function drawText(ctx: CanvasRenderingContext2D, el: CanvasElement): void {
  ctx.save();
  const fontSize = getTextFontSize(el);
  ctx.font = `${fontSize}px ${getCanvasFontFamily('--font-body', 'Inter, sans-serif')}`;
  ctx.fillStyle = el.strokeColor;
  ctx.textBaseline = 'top';
  (el.text ?? '').split('\n').forEach((line, i) => {
    ctx.fillText(line, el.x, el.y + i * (fontSize + 4));
  });
  ctx.restore();
}

function drawSticky(
  roughCanvas: RoughCanvas,
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  shouldCache: boolean
): void {
  ctx.save();
  const width = el.width ?? 160;
  const height = el.height ?? 120;

  ctx.fillStyle = el.fillColor === 'transparent' ? '#fef08a' : el.fillColor;
  ctx.fillRect(el.x, el.y, width, height);

  const drawable = shouldCache ? getDrawable(roughCanvas, el) : createDrawable(roughCanvas, el);
  if (drawable) roughCanvas.draw(drawable);

  ctx.fillStyle = el.strokeColor;
  ctx.font = `14px ${getCanvasFontFamily('--font-body', 'Inter, sans-serif')}`;
  ctx.textBaseline = 'top';
  (el.text ?? '').split('\n').forEach((line, i) => {
    ctx.fillText(line, el.x + 8, el.y + 8 + i * 18);
  });
  ctx.restore();
}

function getCanvasFontFamily(variableName: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;

  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  return fontFamily || fallback;
}
