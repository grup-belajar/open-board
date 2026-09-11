import Dexie, { Table } from 'dexie';
import type { CanvasElement } from '../store/slices/canvasSlice';

export interface BoardRecord {
  id: string;
  name: string;
  elements: CanvasElement[];
  updatedAt: number;
  createdAt: number;
}

class OpenBoardDatabase extends Dexie {
  boards!: Table<BoardRecord, string>;

  constructor() {
    super('OpenBoardDB');
    this.version(1).stores({
      boards: 'id, name, updatedAt',
    });
  }
}

// Dexie butuh objek `window`, jadi instance-nya hanya dibuat di browser.
// Ini mencegah error saat file ini ter-import di sisi server (Next.js SSR).
export const db: OpenBoardDatabase | null =
  typeof window !== 'undefined' ? new OpenBoardDatabase() : null;

/**
 * Simpan (create/update) satu board. Dipanggil oleh middleware autosave
 * maupun secara manual (mis. saat import file JSON).
 */
export async function saveBoard(
  id: string,
  elements: CanvasElement[],
  name = 'Untitled Board'
): Promise<void> {
  if (!db) return;
  const existing = await db.boards.get(id);
  await db.boards.put({
    id,
    name,
    elements,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  });
}

export async function loadBoard(id: string): Promise<BoardRecord | undefined> {
  if (!db) return undefined;
  return db.boards.get(id);
}

/** Semua board, diurutkan dari yang paling baru diedit. */
export async function getAllBoards(): Promise<BoardRecord[]> {
  if (!db) return [];
  const boards = await db.boards.toArray();
  return boards.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function renameBoard(id: string, name: string): Promise<void> {
  if (!db) return;
  await db.boards.update(id, { name, updatedAt: Date.now() });
}

export async function deleteBoard(id: string): Promise<void> {
  if (!db) return;
  await db.boards.delete(id);
}

/** Dipakai tombol "Bersihkan Semua" di landing page. */
export async function clearAllBoards(): Promise<void> {
  if (!db) return;
  await db.boards.clear();
}

/** Generate id board baru yang unik, untuk tombol "Buat Papan Baru" / import JSON. */
export function generateBoardId(): string {
  return `board-${crypto.randomUUID()}`;
}