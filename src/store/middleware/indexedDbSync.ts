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
import {
  beginAutosave,
  completeAutosave,
  failAutosave,
  initializeAutosaveStatus,
  retryAutosave,
  updateAutosaveJournalStatus,
} from '../slices/autosaveSlice';
import { saveBoard, writeAutosaveJournal } from '../../lib/db';

interface PendingSnapshot {
  elements: CanvasElement[];
  requestId: number;
  timer: ReturnType<typeof setTimeout>;
}

type AutosaveStatusAction =
  | ReturnType<typeof beginAutosave>
  | ReturnType<typeof completeAutosave>
  | ReturnType<typeof failAutosave>
  | ReturnType<typeof initializeAutosaveStatus>
  | ReturnType<typeof updateAutosaveJournalStatus>;

type StatusDispatcher = (action: AutosaveStatusAction) => void;

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
const saveRequestIds = new Map<string, number>();

const AUTOSAVE_STATUS_ACTION_TYPES = new Set<string>([
  beginAutosave.type,
  completeAutosave.type,
  failAutosave.type,
  initializeAutosaveStatus.type,
  updateAutosaveJournalStatus.type,
]);

let lifecycleListenersInstalled = false;

function getCurrentBoardId(): string | null {
  if (typeof window === 'undefined') return null;

  const match = window.location.pathname.match(/\/board\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getNextSaveRequestId(boardId: string): number {
  const requestId = (saveRequestIds.get(boardId) ?? 0) + 1;
  saveRequestIds.set(boardId, requestId);
  return requestId;
}

function persistSnapshot(
  boardId: string,
  elements: CanvasElement[],
  requestId: number,
  dispatchStatus: StatusDispatcher,
  retryAttempt = 0
): void {
  const snapshot = JSON.stringify(elements);
  const journalTimestamp = writeAutosaveJournal(boardId, elements);
  const journalAvailable = journalTimestamp !== null;
  dispatchStatus(updateAutosaveJournalStatus({ boardId, requestId, journalAvailable }));
  const previousSave = saveQueues.get(boardId) ?? Promise.resolve();
  const currentSave = previousSave.catch(() => undefined).then(async () => {
    await saveBoard(boardId, elements, undefined, journalTimestamp ?? undefined);
  });

  saveQueues.set(boardId, currentSave);
  void currentSave.then(
    () => {
      clearSaveQueue(boardId, currentSave);
      dispatchStatus(completeAutosave({ boardId, requestId, journalAvailable }));
    },
    (error: unknown) => {
      clearSaveQueue(boardId, currentSave);

      if (retryAttempt < MAX_AUTOSAVE_RETRIES) {
        window.setTimeout(() => {
          if (previousSnapshots.get(boardId) === snapshot) {
            persistSnapshot(boardId, elements, requestId, dispatchStatus, retryAttempt + 1);
          }
        }, AUTOSAVE_RETRY_DELAY_MS);
        return;
      }

      dispatchStatus(failAutosave({ boardId, requestId, journalAvailable }));
      console.error(`[OpenBoard] Autosave board ${boardId} gagal:`, error);
    }
  );
}

function clearSaveQueue(boardId: string, completedSave: Promise<void>): void {
  if (saveQueues.get(boardId) === completedSave) {
    saveQueues.delete(boardId);
  }
}

function flushPendingSnapshot(boardId: string, dispatchStatus: StatusDispatcher): void {
  const pending = pendingSnapshots.get(boardId);
  if (!pending) return;

  clearTimeout(pending.timer);
  pendingSnapshots.delete(boardId);
  persistSnapshot(boardId, pending.elements, pending.requestId, dispatchStatus);
}

function flushAllPendingSnapshots(dispatchStatus: StatusDispatcher): void {
  for (const boardId of pendingSnapshots.keys()) {
    flushPendingSnapshot(boardId, dispatchStatus);
  }
}

function queueSnapshot(
  boardId: string,
  elements: CanvasElement[],
  saveImmediately: boolean,
  dispatchStatus: StatusDispatcher
): void {
  const pending = pendingSnapshots.get(boardId);

  if (saveImmediately) {
    if (pending) clearTimeout(pending.timer);
    pendingSnapshots.delete(boardId);
    const requestId = getNextSaveRequestId(boardId);
    dispatchStatus(beginAutosave({ boardId, requestId, journalAvailable: null }));
    persistSnapshot(boardId, elements, requestId, dispatchStatus);
    return;
  }

  if (pending) {
    pending.elements = elements;
    return;
  }

  const requestId = getNextSaveRequestId(boardId);
  dispatchStatus(beginAutosave({ boardId, requestId, journalAvailable: null }));
  const timer = setTimeout(
    () => flushPendingSnapshot(boardId, dispatchStatus),
    AUTOSAVE_INTERVAL_MS
  );
  pendingSnapshots.set(boardId, { elements, requestId, timer });
}

function installLifecycleListeners(dispatchStatus: StatusDispatcher): void {
  if (lifecycleListenersInstalled || typeof window === 'undefined') return;

  window.addEventListener('pagehide', () => flushAllPendingSnapshots(dispatchStatus));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushAllPendingSnapshots(dispatchStatus);
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

  const dispatchStatus: StatusDispatcher = (statusAction) => {
    store.dispatch(statusAction);
  };
  installLifecycleListeners(dispatchStatus);

  const boardId = getCurrentBoardId();
  if (!boardId) return result;

  const actionType = getActionType(action);
  if (actionType === hydrateCanvas.type) {
    const state = store.getState() as { canvas: { elements: CanvasElement[] } };
    previousSnapshots.set(boardId, JSON.stringify(state.canvas.elements));
    return result;
  }

  if (AUTOSAVE_STATUS_ACTION_TYPES.has(actionType)) return result;

  if (actionType === retryAutosave.type) {
    const requestedBoardId = (action as ReturnType<typeof retryAutosave>).payload.boardId;
    if (requestedBoardId !== boardId) return result;

    const state = store.getState() as { canvas: { elements: CanvasElement[] } };
    const snapshot = JSON.stringify(state.canvas.elements);
    previousSnapshots.set(boardId, snapshot);
    const elements = JSON.parse(snapshot) as CanvasElement[];
    queueSnapshot(boardId, elements, true, dispatchStatus);
    return result;
  }

  if (actionType === commitHistory.type) {
    flushPendingSnapshot(boardId, dispatchStatus);
    return result;
  }

  const state = store.getState() as { canvas: { elements: CanvasElement[] } };
  const snapshot = JSON.stringify(state.canvas.elements);

  if (snapshot === previousSnapshots.get(boardId)) return result;
  previousSnapshots.set(boardId, snapshot);

  const elementsToSave = JSON.parse(snapshot) as CanvasElement[];
  queueSnapshot(
    boardId,
    elementsToSave,
    IMMEDIATE_SAVE_ACTION_TYPES.has(actionType),
    dispatchStatus
  );

  return result;
};
