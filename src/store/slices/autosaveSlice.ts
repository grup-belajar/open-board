import { createAction, createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AutosavePhase = 'idle' | 'saving' | 'saved' | 'error';

export interface BoardAutosaveStatus {
  phase: AutosavePhase;
  requestId: number;
  journalAvailable: boolean | null;
}

interface AutosaveState {
  byBoardId: Record<string, BoardAutosaveStatus>;
}

interface BoardStatusPayload {
  boardId: string;
  requestId: number;
  journalAvailable: boolean;
}

interface BeginAutosavePayload {
  boardId: string;
  requestId: number;
  journalAvailable: boolean | null;
}

interface InitializeStatusPayload {
  boardId: string;
  indexedDbConfirmed: boolean;
  recoveryJournalAvailable: boolean;
}

const initialState: AutosaveState = {
  byBoardId: {},
};

export const autosaveSlice = createSlice({
  name: 'autosave',
  initialState,
  reducers: {
    initializeAutosaveStatus: (state, action: PayloadAction<InitializeStatusPayload>) => {
      const { boardId, indexedDbConfirmed, recoveryJournalAvailable } = action.payload;
      const current = state.byBoardId[boardId];
      if (current?.phase === 'saving') return;

      state.byBoardId[boardId] = {
        phase: indexedDbConfirmed ? 'saved' : recoveryJournalAvailable ? 'error' : 'idle',
        requestId: current?.requestId ?? 0,
        journalAvailable: recoveryJournalAvailable ? true : null,
      };
    },
    beginAutosave: (state, action: PayloadAction<BeginAutosavePayload>) => {
      const { boardId, requestId, journalAvailable } = action.payload;
      const current = state.byBoardId[boardId];
      if (current && current.requestId > requestId) return;

      state.byBoardId[boardId] = {
        phase: 'saving',
        requestId,
        journalAvailable,
      };
    },
    updateAutosaveJournalStatus: (state, action: PayloadAction<BoardStatusPayload>) => {
      const { boardId, requestId, journalAvailable } = action.payload;
      const current = state.byBoardId[boardId];
      if (!current || current.requestId !== requestId) return;

      current.journalAvailable = journalAvailable;
    },
    completeAutosave: (state, action: PayloadAction<BoardStatusPayload>) => {
      const { boardId, requestId, journalAvailable } = action.payload;
      const current = state.byBoardId[boardId];
      if (!current || current.requestId !== requestId) return;

      current.phase = 'saved';
      current.journalAvailable = journalAvailable;
    },
    failAutosave: (state, action: PayloadAction<BoardStatusPayload>) => {
      const { boardId, requestId, journalAvailable } = action.payload;
      const current = state.byBoardId[boardId];
      if (!current || current.requestId !== requestId) return;

      current.phase = 'error';
      current.journalAvailable = journalAvailable;
    },
  },
});

export const retryAutosave = createAction<{ boardId: string }>('autosave/retryAutosave');

export const {
  beginAutosave,
  completeAutosave,
  failAutosave,
  initializeAutosaveStatus,
  updateAutosaveJournalStatus,
} = autosaveSlice.actions;

export default autosaveSlice.reducer;
