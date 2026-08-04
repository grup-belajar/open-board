'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTool } from '../../store/slices/toolSlice';
import { MousePointer, Hand, Pen, Square, Circle, Type, StickyNote, Eraser } from 'lucide-react';
import type { ToolType } from '../../store/slices/toolSlice';

const TOOLS: { type: ToolType; icon: typeof Pen }[] = [
  { type: 'select', icon: MousePointer },
  { type: 'pan', icon: Hand },
  { type: 'pen', icon: Pen },
  { type: 'rectangle', icon: Square },
  { type: 'ellipse', icon: Circle },
  { type: 'text', icon: Type },
  { type: 'sticky', icon: StickyNote },
  { type: 'eraser', icon: Eraser },
];

export default function Toolbar() {
  const dispatch = useDispatch();
  const [active, setActive] = useState<ToolType>('select');

  const handleClick = (type: ToolType) => {
    setActive(type);
    dispatch(setActiveTool(type));
  };

  return (
    <nav className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gray-200 bg-white p-1.5 shadow-lg">
      {TOOLS.map(({ type, icon: Icon }) => (
        <button
          key={type}
          type="button"
          onClick={() => handleClick(type)}
          title={type}
          className={`rounded-full p-2.5 transition-colors ${
            active === type
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </nav>
  );
}