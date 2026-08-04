'use client';

import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setStrokeColor, setStrokeWidth } from '../../store/slices/toolSlice';

export default function PropertyPanel() {
  const dispatch = useDispatch();
  const { strokeColor, strokeWidth } = useSelector((state: RootState) => state.tool);

  return (
    <aside className="fixed right-4 top-16 w-48 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <label className="mb-1 block text-xs font-medium text-gray-500">
        Warna
      </label>
      <input
        type="color"
        value={strokeColor}
        onChange={(e) => dispatch(setStrokeColor(e.target.value))}
        className="mb-3 h-8 w-full cursor-pointer"
      />
      <label className="mb-1 block text-xs font-medium text-gray-500">
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