'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTool } from '../store/slices/toolSlice';
import type { ToolType } from '../store/slices/toolSlice';

const KEY_MAP: Record<string, ToolType> = {
  v: 'select',
  h: 'pan',
  p: 'pen',
  r: 'rectangle',
  o: 'ellipse',
  t: 'text',
  s: 'sticky',
  e: 'eraser',
};

export default function useKeyboardShortcuts() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (KEY_MAP[key] && !event.ctrlKey && !event.metaKey && !event.altKey) {
        dispatch(setActiveTool(KEY_MAP[key]));
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);
}