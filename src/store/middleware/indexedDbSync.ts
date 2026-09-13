import type { Middleware } from '@reduxjs/toolkit';
import type { CanvasElement } from '../slices/canvasSlice';
import {
  addElement,
  commitHistory,
  deleteElement,
  hydrateCanvas,
  redo,
  undo,
  updateElement,
  updateElements,
} from '../slices/canvasSlice';
import { loadBoard, saveBoard } from '../../lib/db';

interface PendingSnapshot {
  elements: CanvasElement[];
  timer: ReturnType<typeof setTimeout>;
}

const AUTOSAVE_INTERVAL_MS = 2000;
const AUTOSAVE_RETRY_DELAY_MS = 2000;
const MAX_AUTOSAVE_RETRIES = 3;

const IMMEDIATE_SAVE_ACTION_TYPES = new Set<string>([
  addElement.type,
  deleteElement.type,
  redo.type,
  undo.type,
  updateElement.type,
  updateElements.type,
]);

const previousSnapshots = new Map<string, string>();
const pendingSnapshots = new Map<string, PendingSnapshot>();
const saveQueues = new Map<string, Promise<void>>();

let lifecycleListenersInstalled = false;

function getCurrentBoardId(): string | null {
  if (typeof window === 'undefined') return null;

  const match = window.location.pathname.match(/\/board\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function persistSnapshot(
  boardId: string,
  elements: CanvasElement[],
  retryAttempt = 0
): void {
  const snapshot = JSON.stringify(elements);
  const previousSave = saveQueues.get(boardId) ?? Promise.resolve();
  const currentSave = previousSave.catch(() => undefined).then(async () => {
    const existing = await loadBoard(boardId);
    await saveBoard(boardId, elements, existing?.name ?? 'Untitled Board');
  });

  saveQueues.set(boardId, currentSave);
  void currentSave.then(
    () => {
      clearSaveQueue(boardId, currentSave);
    },
    (error: unknown) => {
      clearSaveQueue(boardId, currentSave);

      if (retryAttempt < MAX_AUTOSAVE_RETRIES) {
        window.setTimeout(() => {
          if (previousSnapshots.get(boardId) === snapshot) {
            persistSnapshot(boardId, elements, retryAttempt + 1);
          }
        }, AUTOSAVE_RETRY_DELAY_MS);
        return;
      }

      console.error(`[OpenBoard] Autosave board ${boardId} gagal:`, error);
    }
  );
}

function clearSaveQueue(boardId: string, completedSave: Promise<void>): void {
  if (saveQueues.get(boardId) === completedSave) {
    saveQueues.delete(boardId);
  }
}

function flushPendingSnapshot(boardId: string): void {
  const pending = pendingSnapshots.get(boardId);
  if (!pending) return;

  clearTimeout(pending.timer);
  pendingSnapshots.delete(boardId);
  persistSnapshot(boardId, pending.elements);
}

function flushAllPendingSnapshots(): void {
  for (const boardId of pendingSnapshots.keys()) {
    flushPendingSnapshot(boardId);
  }
}

function queueSnapshot(
  boardId: string,
  elements: CanvasElement[],
  saveImmediately: boolean
): void {
  const pending = pendingSnapshots.get(boardId);

  if (saveImmediately) {
    if (pending) clearTimeout(pending.timer);
    pendingSnapshots.delete(boardId);
    persistSnapshot(boardId, elements);
    return;
  }

  if (pending) {
    pending.elements = elements;
    return;
  }

  const timer = setTimeout(() => flushPendingSnapshot(boardId), AUTOSAVE_INTERVAL_MS);
  pendingSnapshots.set(boardId, { elements, timer });
}

function installLifecycleListeners(): void {
  if (lifecycleListenersInstalled || typeof window === 'undefined') return;

  window.addEventListener('pagehide', flushAllPendingSnapshots);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushAllPendingSnapshots();
  });
  lifecycleListenersInstalled = true;
}

function getActionType(action: unknown): string {
  if (typeof action !== 'object' || action === null || !('type' in action)) return '';
  return typeof action.type === 'string' ? action.type : '';
}

export const indexedDbSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  if (typeof window === 'undefined') return result;

  installLifecycleListeners();

  const boardId = getCurrentBoardId();
  if (!boardId) return result;

  const actionType = getActionType(action);
  if (actionType === hydrateCanvas.type) return result;

  if (actionType === commitHistory.type) {
    flushPendingSnapshot(boardId);
    return result;
  }

  const state = store.getState() as { canvas: { elements: CanvasElement[] } };
  const snapshot = JSON.stringify(state.canvas.elements);

  if (snapshot === previousSnapshots.get(boardId)) return result;
  previousSnapshots.set(boardId, snapshot);

  const elementsToSave = JSON.parse(snapshot) as CanvasElement[];
  queueSnapshot(boardId, elementsToSave, IMMEDIATE_SAVE_ACTION_TYPES.has(actionType));

  return result;
};
