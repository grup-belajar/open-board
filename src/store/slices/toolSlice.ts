import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToolType = 'select' | 'pan' | 'pen' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'sticky' | 'eraser';

interface ToolState {
  activeTool: ToolType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

const initialState: ToolState = {
  activeTool: 'select',
  strokeColor: '#000000',
  fillColor: 'transparent',
  strokeWidth: 2,
};

export const toolSlice = createSlice({
  name: 'tool',
  initialState,
  reducers: {
    setActiveTool: (state, action: PayloadAction<ToolType>) => {
      state.activeTool = action.payload;
    },
    setStrokeColor: (state, action: PayloadAction<string>) => {
      state.strokeColor = action.payload;
    },
    setFillColor: (state, action: PayloadAction<string>) => {
      state.fillColor = action.payload;
    },
    setStrokeWidth: (state, action: PayloadAction<number>) => {
      state.strokeWidth = action.payload;
    },
  },
});

export const { setActiveTool, setStrokeColor, setFillColor, setStrokeWidth } = toolSlice.actions;
export default toolSlice.reducer;