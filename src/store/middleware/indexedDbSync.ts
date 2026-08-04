import type { RootState } from '../index';
import { saveBoard } from '../../lib/db';

let previousElementsSnapshot = '';

export const indexedDbSyncMiddleware = (store: { getState: () => RootState }) => (next: (action: unknown) => unknown) => (action: unknown) => {
  const result = next(action);
  const { canvas } = store.getState();
  const snapshot = JSON.stringify(canvas.elements);

  if (snapshot !== previousElementsSnapshot) {
    previousElementsSnapshot = snapshot;
    void saveBoard('default-board', canvas.elements);
  }

  return result;
};
