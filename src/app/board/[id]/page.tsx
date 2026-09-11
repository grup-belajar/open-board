'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadBoard } from '../../../lib/db';
import { hydrateCanvas } from '../../../store/slices/canvasSlice';
import { useAppDispatch } from '../../../store/hooks';
import ButtonShorcut from '@/src/components/ui/button/buttonShorcut';
import ModelExport from '@/src/components/ui/modal/ModelExport';
import Navbar from '../../../components/ui/Navbar';
import WhiteboardCanvas from '../../../components/canvas/WhiteboardCanvas';
import ButtonZoom from '../../../components/ui/button/ButtonZoom';
import Toolbar from '../../../components/ui/Toolbar';
import PropertyPanel from '../../../components/properties/PropertyPanel';
import useKeyboardShortcuts from '../../../hooks/useKeyboardShortcuts';
import FooterBoardPage from '@/src/components/ui/footers/FooterBoard';

export default function BoardPage() {
  const params = useParams<{ id: string }>();
  const boardId = params.id;
  const dispatch = useAppDispatch();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [hydratedBoardId, setHydratedBoardId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<{ boardId: string; message: string } | null>(null);

  useKeyboardShortcuts();

  useEffect(() => {
    let cancelled = false;

    const hydrateBoard = async () => {
      try {
        const board = await loadBoard(boardId);
        if (cancelled) return;

        dispatch(hydrateCanvas({
          elements: board?.elements ?? [],
        }));
        setHydratedBoardId(boardId);
      } catch (error) {
        if (cancelled) return;
        console.error(`[OpenBoard] Gagal memuat board ${boardId}:`, error);
        setLoadError({ boardId, message: 'Board gagal dimuat. Coba lagi.' });
      }
    };

    void hydrateBoard();
    return () => {
      cancelled = true;
    };
  }, [boardId, dispatch, loadAttempt]);

  const isHydrating = hydratedBoardId !== boardId;
  const currentLoadError = loadError?.boardId === boardId ? loadError.message : null;

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
        <Navbar />
        <div className="relative flex-1">
          {isHydrating ? (
            <div className="flex h-full items-center justify-center bg-gray-50" aria-live="polite">
              {currentLoadError ? (
                <div className="flex flex-col items-center gap-4 border-4 border-black bg-white p-6 text-center shadow-hard">
                  <p className="font-display text-lg font-bold">{currentLoadError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoadError(null);
                      setLoadAttempt((attempt) => attempt + 1);
                    }}
                    className="border-4 border-black bg-accent-blue px-5 py-3 font-display font-bold text-white shadow-hard hover:shadow-none"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : (
                <p className="font-display text-lg font-bold">Memuat board...</p>
              )}
            </div>
          ) : (
            <>
              <WhiteboardCanvas />
              <Toolbar />
              <PropertyPanel />
            </>
          )}
        </div>
        {!isHydrating && <ButtonZoom />}
        {!isHydrating && <ButtonShorcut onOpenExport={() => setIsExportOpen(true)} />}
      </div>
      <FooterBoardPage />
      {!isHydrating && isExportOpen && <ModelExport onClose={() => setIsExportOpen(false)} />}
    </>
  );
}
