'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { TextInputDraft } from '../../hooks/useDrawingEngine';

interface CanvasTextComposerProps {
  draft: TextInputDraft;
  viewport: { width: number; height: number };
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

const TEXT_PANEL = { width: 280, height: 248 };
const STICKY_PANEL = { width: 200, height: 248 };

export default function CanvasTextComposer({ draft, viewport, onSubmit, onCancel }: CanvasTextComposerProps) {
  const [value, setValue] = useState(draft.initialText);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelSize = draft.type === 'sticky' ? STICKY_PANEL : TEXT_PANEL;
  const left = Math.max(8, Math.min(draft.screenX, viewport.width - panelSize.width - 8));
  const top = Math.max(8, Math.min(draft.screenY, viewport.height - panelSize.height - 8));

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
      return;
    }

    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      onSubmit(value);
    }
  }

  const isSticky = draft.type === 'sticky';

  return (
    <form
      aria-labelledby="canvas-text-composer-title"
      onSubmit={handleSubmit}
      className={`absolute z-40 flex flex-col gap-3 border-4 border-primary p-3 shadow-hard ${
        isSticky ? 'bg-accent-yellow text-primary' : 'bg-background text-on-surface'
      }`}
      style={{
        left,
        top,
        width: panelSize.width,
        minHeight: panelSize.height,
        backgroundColor: isSticky ? draft.fillColor : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="canvas-text-composer-title" className="font-mono text-label-sm font-bold uppercase">
          {isSticky ? 'Catatan baru' : 'Teks baru'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Batalkan penambahan teks"
          className="border-2 border-primary p-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <label htmlFor="canvas-text-composer-input" className="sr-only">
        {isSticky ? 'Isi catatan' : 'Isi teks'}
      </label>
      <textarea
        id="canvas-text-composer-input"
        ref={inputRef}
        rows={isSticky ? 3 : 4}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isSticky ? 'Tulis catatan...' : 'Tulis teks...'}
        className="min-h-20 w-full resize-y border-2 border-primary bg-white/80 p-2 text-left text-on-surface focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
        style={{
          color: draft.strokeColor,
          fontFamily: 'Inter, sans-serif',
          fontSize: isSticky ? 14 : Math.max(12, draft.strokeWidth * 6),
        }}
      />

      <p className="font-mono text-[10px] leading-snug text-on-surface">
        Ctrl+Enter untuk menambahkan · Escape untuk membatalkan
      </p>

      <div className="mt-auto flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="border-2 border-primary bg-background px-3 py-2 font-mono text-label-sm font-bold text-primary focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
        >
          Batal
        </button>
        <button
          type="submit"
          className="border-2 border-primary bg-accent-blue px-3 py-2 font-mono text-label-sm font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
        >
          Tambahkan
        </button>
      </div>
    </form>
  );
}
