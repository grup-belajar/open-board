import type { CanvasElement } from '../slices/canvasSlice';
import { loadBoard, saveBoard } from '../../lib/db';
import type { Middleware } from '@reduxjs/toolkit';

let previousSnapshotKey = '';
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const AUTOSAVE_DELAY_MS = 2000;

function getCurrentBoardId(): string | null {
  if (typeof window === 'undefined') return null;

  const match = window.location.pathname.match(/\/board\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export const indexedDbSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  if (typeof window === 'undefined') return result;

  const boardId = getCurrentBoardId();
  if (!boardId) return result;

  const state = store.getState() as { canvas: { elements: CanvasElement[] } };
  const snapshot = JSON.stringify(state.canvas.elements);
  const snapshotKey = `${boardId}:${snapshot}`;

  if (snapshotKey !== previousSnapshotKey) {
    previousSnapshotKey = snapshotKey;
    const elementsToSave = JSON.parse(snapshot) as CanvasElement[];

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void (async () => {
        try {
          const existing = await loadBoard(boardId);
          await saveBoard(boardId, elementsToSave, existing?.name ?? 'Untitled Board');
        } catch (error) {
          console.error(`[OpenBoard] Autosave board ${boardId} gagal:`, error);
        }
      })();
    }, AUTOSAVE_DELAY_MS);
  }

  return result;
};
