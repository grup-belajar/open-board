'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Plus, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { generateBoardId } from '../../lib/db';

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  function handleCreateBoard() {
    setIsMobileMenuOpen(false);
    router.push(`/board/${generateBoardId()}`);
  }

  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between border-b-4 border-primary bg-background px-6 py-4 shadow-hard md:px-10">
      <Link
        href="/"
        onClick={() => setIsMobileMenuOpen(false)}
        className="inline-flex items-center gap-2 font-display text-2xl font-extrabold uppercase tracking-tighter text-primary focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-accent-blue md:text-display md:font-black"
      >
        <Image
          src="/openboard-mark.svg"
          alt=""
          width={48}
          height={48}
          className="h-7 w-7 shrink-0 md:h-12 md:w-12"
        />
        OpenBoard
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        <Link href="/" className="font-mono text-label font-bold text-secondary underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-accent-blue">
          Home
        </Link>
        <Link href="/#recent-boards" className="font-mono text-label font-bold text-on-surface transition-colors hover:text-secondary focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-accent-blue">
          Explore
        </Link>

        <div className="ml-4 flex gap-4">
          <button
            type="button"
            onClick={handleCreateBoard}
            className="inline-flex items-center gap-2 border-4 border-primary bg-accent-blue px-6 py-2 font-mono text-label font-bold text-white neobrutal-button focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-accent-blue"
          >
            <Plus className="h-4 w-4" />
            New Board
          </button>
        </div>
      </nav>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          ref={menuButtonRef}
          type="button"
          className="block border-2 border-primary p-2 text-primary focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent-blue md:hidden"
          aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navigasi utama"
          className="absolute left-0 top-full flex w-full flex-col gap-2 border-b-4 border-primary bg-background p-4 shadow-hard md:hidden"
        >
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="border-2 border-primary px-4 py-3 font-mono text-label font-bold text-primary focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
          >
            Home
          </Link>
          <Link
            href="/#recent-boards"
            onClick={() => setIsMobileMenuOpen(false)}
            className="border-2 border-primary px-4 py-3 font-mono text-label text-primary focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
          >
            Explore boards
          </Link>
          <button
            type="button"
            onClick={handleCreateBoard}
            className="inline-flex items-center justify-center gap-2 border-4 border-primary bg-accent-blue px-4 py-3 font-mono text-label font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Board
          </button>
        </nav>
      )}
    </header>
  );
}
