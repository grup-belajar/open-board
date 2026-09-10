'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen, Clock, Trash2, Edit2, Trash } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import {
  getAllBoards,
  deleteBoard,
  clearAllBoards,
  saveBoard,
  generateBoardId,
  type BoardRecord,
} from '../lib/db';
import type { CanvasElement } from '../store/slices/canvasSlice';

const TAGS = [
  { label: 'DIAGRAM', tagColor: 'bg-accent-yellow', rotate: 'rotate-6' },
  { label: 'MINDMAP', tagColor: 'bg-accent-blue text-white', rotate: '-rotate-3' },
  { label: 'SKETSA', tagColor: 'bg-accent-pink text-white', rotate: 'rotate-2' },
];

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

// Menerima dua format JSON: hasil export lama (array polos) dan hasil
// export baru dari exportEngine ({ name, elements }).
function parseImportedJson(raw: string): { name: string; elements: CanvasElement[] } {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    return { name: 'Board Impor', elements: parsed as CanvasElement[] };
  }
  return {
    name: typeof parsed.name === 'string' ? parsed.name : 'Board Impor',
    elements: Array.isArray(parsed.elements) ? parsed.elements : [],
  };
}

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [boards, setBoards] = useState<BoardRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importError, setImportError] = useState<string | null>(null);

  async function refreshBoards() {
    setIsLoading(true);
    const all = await getAllBoards();
    setBoards(all);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const all = await getAllBoards();
      if (!cancelled) {
        setBoards(all);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCreateBoard() {
    router.push(`/board/${generateBoardId()}`);
  }

  async function handleDeleteBoard(id: string) {
    await deleteBoard(id);
    await refreshBoards();
  }

  async function handleClearAll() {
    if (boards.length === 0) return;
    const confirmed = window.confirm(
      `Hapus semua ${boards.length} board tersimpan? Tindakan ini tidak bisa dibatalkan.`
    );
    if (!confirmed) return;
    await clearAllBoards();
    await refreshBoards();
  }

  function handleOpenJsonClick() {
    setImportError(null);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset supaya file yang sama bisa dipilih lagi
    if (!file) return;

    try {
      const text = await file.text();
      const { name, elements } = parseImportedJson(text);
      const id = generateBoardId();
      await saveBoard(id, elements, name);
      router.push(`/board/${id}`);
    } catch (err) {
      console.error('[OpenBoard] Gagal import JSON:', err);
      setImportError('File JSON tidak valid. Pastikan ini hasil ekspor OpenBoard.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b-4 border-primary px-6 py-20 md:px-10">
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="-rotate-2 mb-6 inline-block border-2 border-primary bg-accent-blue px-4 py-1 font-mono text-label font-bold text-white">
              BETA 1.0 AVAILABLE NOW
            </div>

            <h2 className="mb-6 font-display text-5xl font-black uppercase leading-none tracking-tighter text-primary md:text-7xl">
              Papan Tulis Digital Bebas
            </h2>

            <p className="mb-12 inline-block max-w-xl border-2 border-primary bg-white/90 p-4 font-body text-body-lg text-on-surface">
              Coret-coret ide, buat diagram, gratis! Tanpa login, langsung eksekusi.
            </p>

            <div className="flex w-full flex-col justify-center gap-6 md:flex-row">
              <button
                type="button"
                onClick={handleCreateBoard}
                className="inline-flex items-center justify-center gap-3 border-4 border-primary bg-accent-blue px-10 py-5 font-display text-2xl font-black uppercase text-white shadow-hard transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg active:translate-x-2 active:translate-y-2 active:shadow-none"
              >
                <Plus className="h-6 w-6 stroke-[3]" />
                + Buat Papan Baru
              </button>

              <button
                type="button"
                onClick={handleOpenJsonClick}
                className="inline-flex items-center justify-center gap-3 border-4 border-primary bg-white px-10 py-5 font-display text-2xl font-black uppercase text-primary shadow-hard transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg active:translate-x-2 active:translate-y-2 active:shadow-none"
              >
                <FolderOpen className="h-6 w-6 stroke-[3]" />
                Buka File JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleFileSelected}
              />
            </div>

            {importError && (
              <p className="mt-4 border-2 border-accent-pink bg-white px-4 py-2 font-mono text-label-sm text-accent-pink">
                {importError}
              </p>
            )}
          </div>

          <div className="absolute right-10 top-10 hidden opacity-10 md:block">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="black" strokeWidth="6">
              <path d="M10 60 Q30 20 60 60 Q90 100 110 60" />
              <path d="M10 80 Q40 10 80 80" />
            </svg>
          </div>
          <div className="absolute bottom-10 left-10 hidden opacity-10 md:block">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="black" strokeWidth="5">
              <polyline points="10,90 30,30 50,70 70,20 90,60" />
            </svg>
          </div>
        </section>

        {/* Recent Boards */}
        <section className="bg-surface-2 px-6 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
              <div>
                <h3 className="font-display text-4xl font-black uppercase tracking-tighter text-primary md:text-5xl">
                  Papan Terakhir Kamu
                </h3>
                <p className="font-mono text-label text-on-surface-variant">(Tersimpan Lokal di Browser)</p>
              </div>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={boards.length === 0}
                className="inline-flex items-center gap-2 border-4 border-primary bg-accent-pink px-6 py-3 font-mono text-label font-bold text-white shadow-hard transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg active:translate-x-2 active:translate-y-2 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4 stroke-[2.5]" />
                Bersihkan Semua
              </button>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {isLoading && (
                <p className="font-mono text-label text-on-surface-variant">Memuat board...</p>
              )}

              {!isLoading &&
                boards.map((board, index) => {
                  const tag = TAGS[index % TAGS.length];
                  return (
                    <div
                      key={board.id}
                      className="group relative border-4 border-primary bg-white p-4 shadow-hard transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg"
                    >
                      <div
                        className={`absolute -right-4 -top-4 z-20 ${tag.tagColor} ${tag.rotate} border-2 border-primary px-3 py-1 font-mono text-label-sm font-bold`}
                      >
                        {tag.label}
                      </div>

                      <div className="mb-4 h-48 overflow-hidden border-2 border-primary bg-surface-3">
                        <div className="flex h-full w-full items-center justify-center">
                          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" stroke="#1b1b1b" strokeWidth="3" className="opacity-20 group-hover:opacity-30 transition-opacity">
                            <rect x="10" y="10" width="40" height="30" rx="0" />
                            <circle cx="85" cy="25" r="18" />
                            <line x1="10" y1="60" x2="110" y2="60" />
                            <line x1="50" y1="25" x2="67" y2="25" />
                          </svg>
                        </div>
                      </div>

                      <h4 className="mb-2 truncate font-display text-xl font-extrabold text-primary">
                        {board.name}
                      </h4>

                      <div className="flex items-center justify-between text-on-surface-variant">
                        <span className="inline-flex items-center gap-1 font-mono text-label-sm">
                          <Clock className="h-3 w-3" />
                          Edit: {formatRelativeTime(board.updatedAt)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/board/${board.id}`)}
                            className="border-2 border-primary p-1.5 hover:bg-accent-blue hover:text-white transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBoard(board.id)}
                            className="border-2 border-primary p-1.5 hover:bg-accent-pink hover:text-white transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* New board placeholder */}
              <button
                type="button"
                onClick={handleCreateBoard}
                className="flex min-h-[300px] flex-col items-center justify-center border-4 border-dashed border-primary bg-surface p-4 transition-colors hover:bg-surface-2 group"
              >
                <Plus className="mb-4 h-14 w-14 stroke-2 text-primary transition-transform group-hover:scale-110" />
                <p className="font-display text-xl font-black uppercase text-primary">Mulai Papan Baru</p>
              </button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-y-4 border-primary bg-primary px-6 py-24 text-center text-on-primary">
          <h2 className="mb-8 font-display text-5xl font-black uppercase leading-none tracking-tighter md:text-6xl">
            Bawa ide anda ke level selanjutnya
          </h2>
          <p className="mx-auto mb-12 max-w-2xl font-body text-body-lg opacity-80">
            OpenBoard adalah alat open-source gratis untuk kolaborasi visual cepat. Tanpa akun, tanpa biaya tersembunyi.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://github.com/grup-belajar/open-board"
              target="_blank"
              rel="noopener noreferrer"
              className="border-4 border-white bg-white px-8 py-4 font-display text-xl font-black uppercase text-primary transition-all hover:bg-transparent hover:text-white"
            >
              Kontribusi di GitHub
            </a>
            <button
              type="button"
              className="border-4 border-accent-blue bg-accent-blue px-8 py-4 font-display text-xl font-black uppercase text-white transition-all hover:bg-white hover:text-accent-blue"
            >
              Join Community
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-primary bg-primary">
        <div className="flex flex-col items-center justify-between gap-8 px-6 py-8 md:flex-row md:px-10">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-headline font-black uppercase text-on-primary">OpenBoard</h2>
            <p className="font-mono text-label-sm text-on-primary/60">© 2026 OpenBoard · Neobrutalism Edition</p>
          </div>
          <div className="flex flex-wrap gap-8">
            {['Privacy', 'Terms', 'Discord', 'Github'].map((item) => (
              <a key={item} href="#" className="font-mono text-label-sm text-on-primary/70 transition-colors hover:text-accent-blue">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
