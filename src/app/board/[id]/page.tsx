'use client'
import { useEffect } from 'react';
import Navbar from '../../../components/ui/Navbar';
import WhiteboardCanvas from '../../../components/canvas/WhiteboardCanvas';
import ButtonZoom from '../../../components/ui/button/ButtonZoom';
import Sidebar from '../../../components/ui/Sidebar';
import { useAppDispatch } from '../../../store/hooks';
import { setActiveTool, type ToolType } from '../../../store/slices/toolSlice';

const SHORTCUTS: Record<string, ToolType> = {
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

export default function BoardPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) return;
      const tool = SHORTCUTS[event.key.toLowerCase()];
      if (tool) dispatch(setActiveTool(tool));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Navbar />
      <div className="relative flex-1">
        <WhiteboardCanvas />
        <Sidebar />
      </div>
      <ButtonZoom />
    </div>
  );
}
