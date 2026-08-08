'use client'
import Navbar from '../../../components/ui/Navbar';
import WhiteboardCanvas from '@/src/components/canvas/WhiteboardCanvas';
import ButtonZoom from '@/src/components/ui/button/ButtonZoom';
import SudidebrColors from '@/src/components/ui/Sidebar';
import { useState } from 'react';

export default function BoardPage() {
  const [zoom, setZoom] = useState<number>(100);
  const minZoom: number = 75;
  const maxZoom: number = 250;
  const step: number = 10;

  const handleZoom = () => {
    setZoom(prev => Math.min(prev + step, maxZoom))
  }

  const handleOutZoom = () => {
    setZoom(prev => Math.min(prev - step, minZoom))
  }
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Navbar />
      <div className="relative flex-1" style={{
        transform: `scale(${zoom / 100})`,
      }}>
        <WhiteboardCanvas />
        <SudidebrColors />
      </div>
      <ButtonZoom zoom={zoom} handleOutZoom={handleOutZoom} handleZoom={handleZoom} />
    </div>
  );
}
