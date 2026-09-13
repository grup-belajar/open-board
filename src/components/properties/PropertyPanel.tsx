'use client';

import { useLayoutEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setDrawingStyle,
  setStrokeColor,
  setStrokeWidth,
  type DrawingStyle,
} from '../../store/slices/toolSlice';

const DRAWING_STYLE_STORAGE_KEY = 'openboard-drawing-style';

const DRAWING_STYLES: { value: DrawingStyle; label: string }[] = [
  { value: 'sketchy', label: 'Sketsa' },
  { value: 'clean', label: 'Vektor' },
];

export default function PropertyPanel() {
  const dispatch = useAppDispatch();
  const { strokeColor, strokeWidth, drawingStyle } = useAppSelector((state) => state.tool);

  useLayoutEffect(() => {
    try {
      const savedStyle = window.localStorage.getItem(DRAWING_STYLE_STORAGE_KEY);
      if ((savedStyle === 'sketchy' || savedStyle === 'clean') && savedStyle !== drawingStyle) {
        dispatch(setDrawingStyle(savedStyle));
      }
    } catch {
      // The default drawing style remains available when storage is blocked.
    }
  }, [dispatch, drawingStyle]);

  function selectDrawingStyle(style: DrawingStyle): void {
    dispatch(setDrawingStyle(style));

    try {
      window.localStorage.setItem(DRAWING_STYLE_STORAGE_KEY, style);
    } catch {
      // The selected style still applies to new elements on this page.
    }
  }

  return (
    <aside className="fixed right-4 top-16 w-48 rounded-lg border border-primary bg-background p-3 shadow-lg">
      <fieldset className="mb-3">
        <legend className="mb-1 block text-xs font-medium text-on-surface-variant">
          Gaya objek baru
        </legend>
        <div className="grid grid-cols-2 gap-1">
          {DRAWING_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              aria-pressed={drawingStyle === style.value}
              onClick={() => selectDrawingStyle(style.value)}
              className={`border-2 border-primary px-2 py-1.5 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary ${
                drawingStyle === style.value
                  ? 'bg-accent-blue text-white'
                  : 'bg-background text-primary hover:bg-surface-2'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="mb-1 block text-xs font-medium text-on-surface-variant">
        Warna
      </label>
      <input
        type="color"
        value={strokeColor}
        onChange={(e) => dispatch(setStrokeColor(e.target.value))}
        className="mb-3 h-8 w-full cursor-pointer"
      />
      <label className="mb-1 block text-xs font-medium text-on-surface-variant">
        Ukuran Stroke: {strokeWidth}px
      </label>
      <input
        type="range"
        min={1}
        max={20}
        value={strokeWidth}
        onChange={(e) => dispatch(setStrokeWidth(Number(e.target.value)))}
        className="w-full"
      />
    </aside>
  );
}
