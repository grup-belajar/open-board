import type { CanvasElement } from '../slices/canvasSlice';
import { saveBoard } from '../../lib/db';
import type { Middleware } from '@reduxjs/toolkit';

let previousSnapshot = '';
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const AUTOSAVE_DELAY_MS = 2000;

export const indexedDbSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState() as { canvas: { elements: CanvasElement[] } };
  const snapshot = JSON.stringify(state.canvas.elements);

  if (snapshot !== previousSnapshot) {
    previousSnapshot = snapshot;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void saveBoard('default-board', state.canvas.elements);
    }, AUTOSAVE_DELAY_MS);
  }

  return result;
};
