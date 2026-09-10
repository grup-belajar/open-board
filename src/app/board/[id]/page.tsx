'use client'
import ButtonShorcut from '@/src/components/ui/button/buttonShorcut';
import Navbar from '../../../components/ui/Navbar';
import WhiteboardCanvas from '../../../components/canvas/WhiteboardCanvas';
import ButtonZoom from '../../../components/ui/button/ButtonZoom';
import Sidebar from '../../../components/ui/Sidebar';
import useKeyboardShortcuts from '../../../hooks/useKeyboardShortcuts';
import FooterBoardPage from '@/src/components/ui/footers/FooterBoard';

export default function BoardPage() {
  useKeyboardShortcuts();

  return (
    <>

      <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
        <Navbar />
        <div className="relative flex-1">
          <WhiteboardCanvas />
          <Sidebar />
        </div>
        <ButtonZoom />
        <ButtonShorcut />
      </div>
      <FooterBoardPage />
    </>
  );
}
