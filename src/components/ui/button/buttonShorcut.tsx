'use client';

import { CornerUpLeft, CornerUpRight, Download } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { redo, undo } from '../../../store/slices/canvasSlice';

interface ButtonShortcutProps {
  onOpenExport: () => void;
}

export default function ButtonShorcut({ onOpenExport }: ButtonShortcutProps) {
  const dispatch = useAppDispatch();
  const canUndo = useAppSelector((state) => state.canvas.historyIndex > 0);
  const canRedo = useAppSelector(
    (state) => state.canvas.historyIndex < state.canvas.history.length - 1
  );

  return (
    <div className="absolute bottom-4 right-5 z-50 flex flex-row gap-4">
      <div className="flex flex-row justify-between gap-4">
        <button
          type="button"
          onClick={() => dispatch(undo())}
          disabled={!canUndo}
          className="h-12 cursor-pointer border-4 border-black bg-white px-2 shadow-hard transition-all hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 md:h-14 md:px-5"
          title="Undo (CTRL + Z)"
          aria-label="Undo"
        >
          <CornerUpLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => dispatch(redo())}
          disabled={!canRedo}
          className="h-12 cursor-pointer border-4 border-black bg-white px-2 shadow-hard transition-all hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 md:h-14 md:px-5"
          title="Redo (CTRL + Y)"
          aria-label="Redo"
        >
          <CornerUpRight aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onOpenExport}
          className="h-12 cursor-pointer border-4 border-black bg-accent-blue px-2 text-white shadow-hard transition-all hover:shadow-none md:h-14 md:px-5"
          title="Export board"
          aria-label="Export board"
        >
          <Download aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
