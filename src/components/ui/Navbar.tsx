'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b-4 border-primary bg-background px-6 py-4 shadow-hard md:px-10">
      <Link href="/" className="font-display text-headline uppercase tracking-tighter text-primary">
        OpenBoard
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        <Link href="/" className="font-mono text-label font-bold text-secondary underline underline-offset-4">
          Home
        </Link>
        <Link href="#" className="font-mono text-label text-on-surface hover:text-secondary transition-colors">
          Explore
        </Link>

        <div className="ml-4 flex gap-4">
          <Link
            href="/board/default-board"
            className="inline-flex items-center gap-2 border-4 border-primary bg-accent-blue px-6 py-2 font-mono text-label font-bold text-white neobrutal-button"
          >
            <Plus className="h-4 w-4" />
            New Board
          </Link>
        </div>
      </nav>

      <button type="button" className="block border-2 border-primary p-2 md:hidden">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
    </header>
  );
}