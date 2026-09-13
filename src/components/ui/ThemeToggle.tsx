'use client';

import { SunMoon } from 'lucide-react';
import { useLayoutEffect } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'openboard-theme';

function readTheme(): Theme {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
  useLayoutEffect(() => {
    applyTheme(readTheme());
  }, []);

  function toggleTheme(): void {
    const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The theme remains active for this page even if storage is unavailable.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Ganti tema terang atau gelap"
      title="Ganti tema terang atau gelap"
      className="inline-flex h-11 w-11 items-center justify-center border-4 border-primary bg-background text-primary transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-secondary"
    >
      <SunMoon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
