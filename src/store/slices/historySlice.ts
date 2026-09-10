import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface DrawElements {
    id: string;
    type: 'pen' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'sticky' | 'eraser';
    x: number;
    y: number;
    width: number;
    height: number;
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    content?: string
}

interface HistoryState {
    history: DrawElements[][];
    currentIndex: number;
}

const initialState: HistoryState = {
    history: [[]],
    currentIndex: 0
}

export const historySlice = createSlice(
    {
        name: "history",
        initialState,
        reducers: {
            addElement: (state, action: PayloadAction<DrawElements>) => {
                const currentState = [...state.history[state.currentIndex], action.payload];
                state.history = state.history.slice(0, state.currentIndex + 1)

                state.history.push(currentState);
                state.currentIndex += 1
            },

            removeElements: (state, action: PayloadAction<string>) => {
                const currentState = state.history[state.currentIndex].filter(
                    (el) => el.id !== action.payload
                );
                state.history = state.history.slice(0, state.currentIndex + 1);
                state.history.push(currentState);
                state.currentIndex += 1
            },

            undo: (state) => {
                if (state.currentIndex > 0) {
                    state.currentIndex -= 1
                }
            },

            redo: (state) => {
                if (state.currentIndex < state.history.length - 1) {
                    state.currentIndex += 1
                }
            },

            clearHistory: (state) => {
                state.history = [[]];
                state.currentIndex = 0
            }
        }
    }
)

export const { addElement, removeElements, undo, redo, clearHistory } = historySlice.actions;
export default historySlice.reducer;

export const SelectCurrentState = (state: { history: HistoryState }) =>
    state.history.history[state.history.currentIndex];
export const SelectCanUndo = (state: { history: HistoryState }) =>
    state.history.currentIndex > 0;
export const SelectCanRedo = (state: { history: HistoryState }) =>
    state.history.currentIndex < state.history.history.length - 1;