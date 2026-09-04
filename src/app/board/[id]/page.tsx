'use client'
import ButtonShorcut from '@/src/components/ui/button/buttonShorcut';
import Navbar from '../../../components/ui/Navbar';
import WhiteboardCanvas from '@/src/components/canvas/WhiteboardCanvas';
import ButtonZoom from '@/src/components/ui/button/ButtonZoom';
import SudidebrColors from '@/src/components/ui/Sidebar';
import { useState } from 'react';

export default function BoardPage() {
  const [zoom, setZoom] = useState<number>(100);
  const [stateBlur, setBlur] = useState<boolean>(false);
  const minZoom: number = 75;
  const maxZoom: number = 250;
  const step: number = 5;
  const handleZoom = () => {
    setZoom(prev => Math.min(prev + step, maxZoom))
  }

  const handleOutZoom = () => {
    setZoom(prev => Math.min(prev - step, minZoom))
  }

  const handleBlurCanvas = (value: boolean) => {
    setBlur(value)
  }
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Navbar />
      <div className="relative flex-1" style={{
        transform: `scale(${zoom / 100})`,
      }}>
        <WhiteboardCanvas blurCanvas={`h-screen w-full ${stateBlur ? "bg-gray-100/10 blur-2xl" : "bg-white blur-none"}`} />
        <SudidebrColors setBlur={handleBlurCanvas} />
      </div>
      <ButtonZoom zoom={zoom} handleOutZoom={handleOutZoom} handleZoom={handleZoom} />
      <ButtonShorcut />
    </div>
  );
}
