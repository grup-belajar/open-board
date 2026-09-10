import type { CanvasElement } from '../store/slices/canvasSlice';
import type { BoardRecord } from './db';

/** [FE-03.2] Modul ekspor: PNG (1x/2x/3x), SVG Vektor, dan JSON backup. */

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

// ---------------------------------------------------------------------------
// JSON export (backup lengkap, bisa di-import kembali lewat landing page)
// ---------------------------------------------------------------------------

export function exportToJson(elements: CanvasElement[], boardName = 'Untitled Board'): void {
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

export function exportBoardToJson(board: BoardRecord): void {
  exportToJson(board.elements, board.name);
}

// ---------------------------------------------------------------------------
// PNG export (rasterisasi dari <canvas> yang sudah dirender WhiteboardCanvas)
// ---------------------------------------------------------------------------

export type PngScale = 1 | 2 | 3;

/**
 * Ambil isi <canvas> yang sedang tampil dan simpan sebagai PNG.
 * `scale` menaikkan resolusi output (2x/3x) dengan menggambar ulang
 * ke canvas sementara yang lebih besar.
 *
 * Catatan: karena sumbernya canvas yang sudah dirasterisasi, upscale
 * 2x/3x tidak menambah detail baru (tidak sepenuhnya lossless). Untuk
 * hasil paling tajam, idealnya WhiteboardCanvas di-render ulang pada
 * devicePixelRatio yang lebih tinggi sebelum export — ini bisa jadi
 * catatan koordinasi dengan pemilik WhiteboardCanvas.tsx.
 */
export async function exportCanvasToPng(
  sourceCanvas: HTMLCanvasElement,
  scale: PngScale = 1,
  filename = 'openboard.png'
): Promise<void> {
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = sourceCanvas.width * scale;
  targetCanvas.height = sourceCanvas.height * scale;

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) throw new Error('Tidak bisa membuat konteks 2D untuk export PNG');

  // Background putih solid, karena canvas asli transparan.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, 0, 0, targetCanvas.width, targetCanvas.height);

  const blob: Blob | null = await new Promise((resolve) =>
    targetCanvas.toBlob(resolve, 'image/png')
  );
  if (!blob) throw new Error('Gagal membuat blob PNG');

  triggerDownload(blob, filename);
}

// ---------------------------------------------------------------------------
// SVG export (vektor, dibangun langsung dari data Redux `CanvasElement[]`)
// ---------------------------------------------------------------------------

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function elementToSvgNode(el: CanvasElement): string {
  const stroke = el.strokeColor || '#000000';
  const fill = el.fillColor && el.fillColor !== 'transparent' ? el.fillColor : 'none';
  const strokeWidth = el.strokeWidth ?? 2;

  switch (el.type) {
    case 'rectangle':
      return `<rect x="${el.x}" y="${el.y}" width="${el.width ?? 0}" height="${el.height ?? 0}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" />`;

    case 'ellipse': {
      const w = el.width ?? 0;
      const h = el.height ?? 0;
      return `<ellipse cx="${el.x + w / 2}" cy="${el.y + h / 2}" rx="${w / 2}" ry="${h / 2}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" />`;
    }

    case 'line': {
      const w = el.width ?? 0;
      const h = el.height ?? 0;
      return `<line x1="${el.x}" y1="${el.y}" x2="${el.x + w}" y2="${el.y + h}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
    }

    case 'freehand': {
      if (!el.points || el.points.length === 0) return '';
      const points = el.points.map((p) => `${p.x},${p.y}`).join(' ');
      return `<polyline points="${points}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
    }

    case 'text':
      return `<text x="${el.x}" y="${el.y}" fill="${stroke}" font-family="sans-serif" font-size="16">${escapeXml(el.text ?? '')}</text>`;

    case 'sticky': {
      const w = el.width ?? 160;
      const h = el.height ?? 160;
      const bg = el.fillColor && el.fillColor !== 'transparent' ? el.fillColor : '#fff9b0';
      return [
        `<rect x="${el.x}" y="${el.y}" width="${w}" height="${h}" fill="${bg}" stroke="${stroke}" stroke-width="${strokeWidth}" />`,
        `<foreignObject x="${el.x + 8}" y="${el.y + 8}" width="${w - 16}" height="${h - 16}">`,
        `<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;">${escapeXml(el.text ?? '')}</div>`,
        `</foreignObject>`,
      ].join('');
    }

    default:
      return '';
  }
}

function getBoundingBox(elements: CanvasElement[]) {
  if (elements.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const el of elements) {
    const points = el.points?.length
      ? el.points
      : [{ x: el.x, y: el.y }, { x: el.x + (el.width ?? 0), y: el.y + (el.height ?? 0) }];

    for (const p of points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }

  const padding = 40;
  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
  };
}

export function exportElementsToSvg(elements: CanvasElement[], filename = 'openboard.svg'): void {
  const { minX, minY, maxX, maxY } = getBoundingBox(elements);
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  const body = elements.map(elementToSvgNode).join('\n  ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#ffffff" />
  ${body}
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  triggerDownload(blob, filename);
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'openboard';
}
