import type { CanvasElement } from '../slices/canvasSlice';
import { saveBoard, loadBoard } from '../../lib/db';
import type { Middleware } from '@reduxjs/toolkit';

let previousSnapshot = '';
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** [FE-03.1] Autosave Redux -> IndexedDB setiap 2 detik jika ada perubahan. */
const AUTOSAVE_DELAY_MS = 2000;

/**
 * Board id diambil dari URL (/board/[id]) alih-alih di-hardcode,
 * supaya tiap board tersimpan terpisah di IndexedDB.
 * Middleware ini hanya berjalan di browser, jadi aman pakai window.location.
 */
function getCurrentBoardId(): string {
  if (typeof window === 'undefined') return 'default-board';
  const match = window.location.pathname.match(/\/board\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : 'default-board';
}

export const indexedDbSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Guard SSR: middleware ini tidak boleh menyentuh IndexedDB di server.
  if (typeof window === 'undefined') return result;

  const state = store.getState() as { canvas: { elements: CanvasElement[] } };
  const snapshot = JSON.stringify(state.canvas.elements);

  // Hindari menjadwalkan save kalau action tidak benar-benar mengubah elemen
  // (mis. action UI seperti setSelectedElementIds).
  if (snapshot === previousSnapshot) return result;
  previousSnapshot = snapshot;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const boardId = getCurrentBoardId();
    void (async () => {
      try {
        // Pertahankan nama board yang sudah ada, jangan sampai autosave
        // menimpa nama board dengan "Untitled Board" tiap kali save.
        const existing = await loadBoard(boardId);
        await saveBoard(boardId, state.canvas.elements, existing?.name ?? 'Untitled Board');
      } catch (err) {
        console.error('[OpenBoard] Autosave ke IndexedDB gagal:', err);
      }
    })();
  }, AUTOSAVE_DELAY_MS);

  return result;
};
