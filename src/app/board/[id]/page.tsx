'use client'
import Navbar from '../../../components/ui/Navbar';
import WhiteboardCanvas from '../../../components/canvas/WhiteboardCanvas';
import ButtonZoom from '../../../components/ui/button/ButtonZoom';
import SudidebrColors from '../../../components/ui/Sidebar';

export default function BoardPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Navbar />
      <div className="relative flex-1">
        <WhiteboardCanvas />
        <SudidebrColors />
      </div>
      <ButtonZoom />
    </div>
  );
}
