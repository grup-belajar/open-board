import { configureStore } from '@reduxjs/toolkit';
import canvasReducer from './slices/canvasSlice';
import toolReducer from './slices/toolSlice';
import historyReducer from "./slices/historySlice"
import { indexedDbSyncMiddleware } from './middleware/indexedDbSync';

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    tool: toolReducer,
    history: historyReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(indexedDbSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
