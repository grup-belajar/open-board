import type { CanvasElement } from '../slices/canvasSlice';
import { saveBoard, loadBoard } from '../../lib/db';
import type { Middleware } from '@reduxjs/toolkit';

let previousSnapshotKey = '';
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** [FE-03.1] Autosave Redux -> IndexedDB setiap 2 detik jika ada perubahan. */
const AUTOSAVE_DELAY_MS = 2000;

/**
 * Board id diambil dari URL (/board/[id]) alih-alih di-hardcode,
 * supaya tiap board tersimpan terpisah di IndexedDB.
 * Middleware ini hanya berjalan di browser, jadi aman pakai window.location.
 */
function getCurrentBoardId(): string | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/\/board\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export const indexedDbSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Guard SSR: middleware ini tidak boleh menyentuh IndexedDB di server.
  if (typeof window === 'undefined') return result;

  const boardId = getCurrentBoardId();
  if (!boardId) return result;

  const state = store.getState() as { canvas: { elements: CanvasElement[] } };
  const snapshot = JSON.stringify(state.canvas.elements);
  const snapshotKey = `${boardId}:${snapshot}`;

  // Hindari menjadwalkan save kalau action tidak benar-benar mengubah elemen
  // (mis. action UI seperti setSelectedElementIds).
  if (snapshotKey === previousSnapshotKey) return result;
  previousSnapshotKey = snapshotKey;
  const elementsToSave = JSON.parse(snapshot) as CanvasElement[];

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void (async () => {
      try {
        // Pertahankan nama board yang sudah ada, jangan sampai autosave
        // menimpa nama board dengan "Untitled Board" tiap kali save.
        const existing = await loadBoard(boardId);
        await saveBoard(boardId, elementsToSave, existing?.name ?? 'Untitled Board');
      } catch (err) {
        console.error('[OpenBoard] Autosave ke IndexedDB gagal:', err);
      }
    })();
  }, AUTOSAVE_DELAY_MS);

  return result;
};
