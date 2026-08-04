import type { CanvasElement } from '../store/slices/canvasSlice';

export function exportToJson(elements: CanvasElement[]): void {
  const blob = new Blob([JSON.stringify(elements, null, 2)], {
    type: 'application/json',
  });
  triggerDownload(blob, 'openboard.json');
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}