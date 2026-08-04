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

interface CanvasState {
  elements: CanvasElement[];
  selectedElementIds: string[];
}

const initialState: CanvasState = {
  elements: [],
  selectedElementIds: [],
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
    deleteElement: (state, action: PayloadAction<string>) => {
      state.elements = state.elements.filter(el => el.id !== action.payload);
    },
    setSelectedElementIds: (state, action: PayloadAction<string[]>) => {
      state.selectedElementIds = action.payload;
    },
  },
});

export const { setElements, addElement, updateElement, deleteElement, setSelectedElementIds } = canvasSlice.actions;
export default canvasSlice.reducer;
