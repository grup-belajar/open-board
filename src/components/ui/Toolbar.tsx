'use client';

import {
  Circle,
  Hand,
  Minus,
  MousePointer,
  Pen,
  Square,
  StickyNote,
  Type,
  Eraser,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveTool, type ToolType } from '../../store/slices/toolSlice';

const TOOLS: { type: ToolType; label: string; icon: typeof Pen }[] = [
  { type: 'select', label: 'Select', icon: MousePointer },
  { type: 'pan', label: 'Pan', icon: Hand },
  { type: 'pen', label: 'Pen', icon: Pen },
  { type: 'rectangle', label: 'Rectangle', icon: Square },
  { type: 'ellipse', label: 'Ellipse', icon: Circle },
  { type: 'line', label: 'Line', icon: Minus },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'sticky', label: 'Sticky note', icon: StickyNote },
  { type: 'eraser', label: 'Eraser', icon: Eraser },
];

export default function Toolbar() {
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector((state) => state.tool.activeTool);

  return (
    <nav
      aria-label="Canvas tools"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 border-4 border-primary bg-white p-1.5 shadow-hard"
    >
      {TOOLS.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          type="button"
          onClick={() => dispatch(setActiveTool(type))}
          title={`${label} (${type === 'select' ? 'V' : type === 'pan' ? 'H' : ''})`}
          aria-label={label}
          aria-pressed={activeTool === type}
          className={`p-2.5 transition-colors ${
            activeTool === type
              ? 'bg-primary text-white'
              : 'text-primary hover:bg-accent-blue hover:text-white'
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
