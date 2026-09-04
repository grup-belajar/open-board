'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setActiveTool } from '../store/slices/toolSlice';
import { undo, redo } from '../store/slices/canvasSlice';
import type { ToolType } from '../store/slices/toolSlice';

const KEY_MAP: Record<string, ToolType> = {
  v: 'select',
  h: 'pan',
  p: 'pen',
  r: 'rectangle',
  o: 'ellipse',
  l: 'line',
  t: 'text',
  s: 'sticky',
  e: 'eraser',
};

export default function useKeyboardShortcuts() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) dispatch(redo());
        else dispatch(undo());
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        dispatch(redo());
        return;
      }

      const key = event.key.toLowerCase();
      if (KEY_MAP[key] && !event.ctrlKey && !event.metaKey && !event.altKey) {
        dispatch(setActiveTool(KEY_MAP[key]));
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);
}