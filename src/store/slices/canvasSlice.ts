import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CanvasElement {
  id: string;
  type: 'freehand' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'sticky';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughness: number;
  text?: string;
}

export interface PanZoom {
  panOffset: { x: number; y: number };
  zoomLevel: number;
}

interface CanvasState {
  elements: CanvasElement[];
  selectedElementIds: string[];
  panOffset: { x: number; y: number };
  zoomLevel: number;
  history: CanvasElement[][];
  historyIndex: number;
}

const MAX_HISTORY = 100;

function cloneElements(elements: CanvasElement[]): CanvasElement[] {
  return elements.map((el) => ({
    ...el,
    points: el.points ? el.points.map((p) => ({ ...p })) : undefined,
  }));
}

const initialState: CanvasState = {
  elements: [],
  selectedElementIds: [],
  panOffset: { x: 0, y: 0 },
  zoomLevel: 1,
  history: [[]],
  historyIndex: 0,
};

function commitSnapshot(state: CanvasState, nextElements: CanvasElement[]) {
  if (JSON.stringify(state.elements) === JSON.stringify(nextElements)) return;
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(cloneElements(nextElements));
  if (state.history.length > MAX_HISTORY) {
    state.history.shift();
  }
  state.historyIndex = state.history.length - 1;
  state.elements = nextElements;
}

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setElements: (state, action: PayloadAction<CanvasElement[]>) => {
      state.elements = action.payload;
    },
    addElement: (state, action: PayloadAction<CanvasElement>) => {
      commitSnapshot(state, [...state.elements, action.payload]);
    },
    updateElement: (state, action: PayloadAction<CanvasElement>) => {
      const index = state.elements.findIndex(el => el.id === action.payload.id);
      if (index === -1) return;
      const next = [...state.elements];
      next[index] = action.payload;
      commitSnapshot(state, next);
    },
    updateElements: (state, action: PayloadAction<CanvasElement[]>) => {
      const byId = new Map(action.payload.map(el => [el.id, el]));
      const next = state.elements.map(el => byId.get(el.id) ?? el);
      commitSnapshot(state, next);
    },
    deleteElement: (state, action: PayloadAction<string>) => {
      const next = state.elements.filter(el => el.id !== action.payload);
      commitSnapshot(state, next);
      state.selectedElementIds = state.selectedElementIds.filter(id => id !== action.payload);
    },
    setSelectedElementIds: (state, action: PayloadAction<string[]>) => {
      state.selectedElementIds = action.payload;
    },
    setPanZoom: (state, action: PayloadAction<PanZoom>) => {
      state.panOffset = action.payload.panOffset;
      state.zoomLevel = action.payload.zoomLevel;
    },
    commitHistory: (state) => {
      const snapshot = cloneElements(state.elements);
      const top = state.history[state.historyIndex];
      if (top && JSON.stringify(snapshot) === JSON.stringify(top)) return;
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(snapshot);
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      }
      state.historyIndex = state.history.length - 1;
    },
    undo: (state) => {
      if (state.historyIndex <= 0) return;
      state.historyIndex -= 1;
      state.elements = cloneElements(state.history[state.historyIndex]);
      state.selectedElementIds = [];
    },
    redo: (state) => {
      if (state.historyIndex >= state.history.length - 1) return;
      state.historyIndex += 1;
      state.elements = cloneElements(state.history[state.historyIndex]);
      state.selectedElementIds = [];
    },
  },
});

export const {
  setElements,
  addElement,
  updateElement,
  updateElements,
  deleteElement,
  setSelectedElementIds,
  setPanZoom,
  commitHistory,
  undo,
  redo,
} = canvasSlice.actions;
export default canvasSlice.reducer;
