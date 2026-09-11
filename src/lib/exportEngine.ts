import type { CanvasElement } from '../store/slices/canvasSlice';
import { createRoughRenderer, drawElement } from './roughEngine';

export type PngScale = 1 | 2 | 3;

export interface RasterExportOptions {
  scale?: PngScale;
  transparent?: boolean;
  filename?: string;
}

export interface VectorExportOptions {
  transparent?: boolean;
  filename?: string;
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const DEFAULT_FILENAME = 'openboard';
const EXPORT_PADDING = 40;

export function exportToJson(elements: CanvasElement[], boardName = DEFAULT_FILENAME): void {
  const payload = {
    name: boardName,
    elements,
    exportedAt: new Date().toISOString(),
    version: 1,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });

  triggerDownload(blob, `${slugify(boardName)}.json`);
}

export async function exportElementsToPng(
  elements: CanvasElement[],
  options: RasterExportOptions = {}
): Promise<void> {
  const scale = options.scale ?? 1;
  const transparent = options.transparent ?? false;
  const bounds = getContentBounds(elements);
  const width = Math.max(1, Math.ceil((bounds.maxX - bounds.minX) * scale));
  const height = Math.max(1, Math.ceil((bounds.maxY - bounds.minY) * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Tidak bisa membuat konteks 2D untuk export PNG');

  if (!transparent) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }

  context.save();
  context.translate(-bounds.minX * scale, -bounds.minY * scale);
  context.scale(scale, scale);

  const roughCanvas = createRoughRenderer(canvas);
  elements.forEach((element) => drawElement(roughCanvas, context, element));
  context.restore();

  const blob = await canvasToBlob(canvas, 'image/png');
  triggerDownload(blob, options.filename ?? `${DEFAULT_FILENAME}.png`);
}

export function exportElementsToSvg(
  elements: CanvasElement[],
  options: VectorExportOptions = {}
): void {
  const transparent = options.transparent ?? false;
  const bounds = getContentBounds(elements);
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  const body = elements.map(elementToSvgNode).filter(Boolean).join('\n  ');
  const background = transparent
    ? ''
    : `<rect x="${bounds.minX}" y="${bounds.minY}" width="${width}" height="${height}" fill="#ffffff" />`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX} ${bounds.minY} ${width} ${height}" width="${width}" height="${height}">
  ${background}
  ${body}
</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });

  triggerDownload(blob, options.filename ?? `${DEFAULT_FILENAME}.svg`);
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getContentBounds(elements: CanvasElement[]): Bounds {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  }

  const bounds = elements.reduce<Bounds>(
    (current, element) => mergeBounds(current, getElementBounds(element)),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  return {
    minX: bounds.minX - EXPORT_PADDING,
    minY: bounds.minY - EXPORT_PADDING,
    maxX: bounds.maxX + EXPORT_PADDING,
    maxY: bounds.maxY + EXPORT_PADDING,
  };
}

function getElementBounds(element: CanvasElement): Bounds {
  if (element.type === 'freehand' && element.points && element.points.length > 0) {
    return element.points.reduce<Bounds>(
      (bounds, point) => ({
        minX: Math.min(bounds.minX, point.x),
        minY: Math.min(bounds.minY, point.y),
        maxX: Math.max(bounds.maxX, point.x),
        maxY: Math.max(bounds.maxY, point.y),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );
  }

  if (element.type === 'text') {
    const fontSize = Math.max(12, element.strokeWidth * 6);
    const lines = (element.text ?? '').split('\n');
    const longestLine = Math.max(...lines.map((line) => line.length), 0);
    return {
      minX: element.x,
      minY: element.y,
      maxX: element.x + longestLine * fontSize * 0.7,
      maxY: element.y + lines.length * (fontSize + 4),
    };
  }

  const width = element.width ?? 0;
  const height = element.height ?? 0;
  const maxX = element.x + width;
  const maxY = element.y + height;

  return {
    minX: Math.min(element.x, maxX),
    minY: Math.min(element.y, maxY),
    maxX: Math.max(element.x, maxX),
    maxY: Math.max(element.y, maxY),
  };
}

function mergeBounds(first: Bounds, second: Bounds): Bounds {
  return {
    minX: Math.min(first.minX, second.minX),
    minY: Math.min(first.minY, second.minY),
    maxX: Math.max(first.maxX, second.maxX),
    maxY: Math.max(first.maxY, second.maxY),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Gagal membuat file export'));
    }, type);
  });
}

function elementToSvgNode(element: CanvasElement): string {
  const stroke = element.strokeColor || '#000000';
  const fill = element.fillColor && element.fillColor !== 'transparent'
    ? element.fillColor
    : 'none';
  const strokeWidth = element.strokeWidth ?? 2;

  switch (element.type) {
    case 'rectangle': {
      const width = Math.abs(element.width ?? 0);
      const height = Math.abs(element.height ?? 0);
      const x = Math.min(element.x, element.x + (element.width ?? 0));
      const y = Math.min(element.y, element.y + (element.height ?? 0));
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" />`;
    }
    case 'ellipse': {
      const rawWidth = element.width ?? 0;
      const rawHeight = element.height ?? 0;
      const width = Math.abs(rawWidth);
      const height = Math.abs(rawHeight);
      const x = Math.min(element.x, element.x + rawWidth);
      const y = Math.min(element.y, element.y + rawHeight);
      return `<ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width / 2}" ry="${height / 2}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" />`;
    }
    case 'line':
      return `<line x1="${element.x}" y1="${element.y}" x2="${element.x + (element.width ?? 0)}" y2="${element.y + (element.height ?? 0)}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
    case 'freehand': {
      if (!element.points || element.points.length === 0) return '';
      const points = element.points.map((point) => `${point.x},${point.y}`).join(' ');
      return `<polyline points="${points}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
    }
    case 'text':
      return `<text x="${element.x}" y="${element.y}" fill="${stroke}" font-family="sans-serif" font-size="${Math.max(12, strokeWidth * 6)}">${escapeXml(element.text ?? '')}</text>`;
    case 'sticky': {
      const width = element.width ?? 160;
      const height = element.height ?? 120;
      const background = element.fillColor && element.fillColor !== 'transparent'
        ? element.fillColor
        : '#fef08a';
      const lines = (element.text ?? '').split('\n').map((line, index) =>
        `<tspan x="${element.x + 8}" dy="${index === 0 ? 0 : 18}">${escapeXml(line)}</tspan>`
      ).join('');

      return `<rect x="${element.x}" y="${element.y}" width="${width}" height="${height}" fill="${background}" stroke="${stroke}" stroke-width="${strokeWidth}" /><text x="${element.x + 8}" y="${element.y + 22}" fill="${stroke}" font-family="sans-serif" font-size="14">${lines}</text>`;
    }
    default:
      return '';
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || DEFAULT_FILENAME;
}
