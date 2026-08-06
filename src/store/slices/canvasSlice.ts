import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const initialState: CanvasState = {
  elements: [],
  selectedElementIds: [],
  panOffset: { x: 0, y: 0 },
  zoomLevel: 1,
  history: [],
  historyIndex: -1,
};

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setElements: (state, action: PayloadAction<CanvasElement[]>) => {
      state.elements = action.payload;
    },
    addElement: (state, action: PayloadAction<CanvasElement>) => {
      state.elements.push(action.payload);
    },
    updateElement: (state, action: PayloadAction<CanvasElement>) => {
      const index = state.elements.findIndex(el => el.id === action.payload.id);
      if (index !== -1) {
        state.elements[index] = action.payload;
      }
    },
    updateElements: (state, action: PayloadAction<CanvasElement[]>) => {
      const byId = new Map(action.payload.map(el => [el.id, el]));
      state.elements = state.elements.map(el => byId.get(el.id) ?? el);
    },
    deleteElement: (state, action: PayloadAction<string>) => {
      state.elements = state.elements.filter(el => el.id !== action.payload);
      state.selectedElementIds = state.selectedElementIds.filter(id => id !== action.payload);
    },
    setSelectedElementIds: (state, action: PayloadAction<string[]>) => {
      state.selectedElementIds = action.payload;
    },
    setPanZoom: (state, action: PayloadAction<PanZoom>) => {
      state.panOffset = action.payload.panOffset;
      state.zoomLevel = action.payload.zoomLevel;
    },
    pushHistory: (state) => {
      const snapshot = state.elements.map(el => ({ ...el }));
      const trimmed = state.history.slice(0, state.historyIndex + 1);
      trimmed.push(snapshot);
      if (trimmed.length > MAX_HISTORY) {
        trimmed.shift();
      }
      state.history = trimmed;
      state.historyIndex = trimmed.length - 1;
    },
    undo: (state) => {
      if (state.historyIndex < 0) return;
      state.historyIndex -= 1;
      state.elements =
        state.historyIndex >= 0
          ? state.history[state.historyIndex].map(el => ({ ...el }))
          : [];
      state.selectedElementIds = [];
    },
    redo: (state) => {
      if (state.historyIndex >= state.history.length - 1) return;
      state.historyIndex += 1;
      state.elements = state.history[state.historyIndex].map(el => ({ ...el }));
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
  pushHistory,
  undo,
  redo,
} = canvasSlice.actions;
export default canvasSlice.reducer;
