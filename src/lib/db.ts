import Dexie, { Table } from 'dexie';
import type { CanvasElement } from '../store/slices/canvasSlice';

export interface BoardRecord {
  id: string;
  name: string;
  elements: CanvasElement[];
  updatedAt: number;
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

export const db = new OpenBoardDatabase();

export async function saveBoard(id: string, elements: CanvasElement[], name = 'Untitled Board'): Promise<void> {
  await db.boards.put({
    id,
    name,
    elements,
    updatedAt: Date.now(),
  });
}

export async function loadBoard(id: string): Promise<BoardRecord | undefined> {
  return db.boards.get(id);
}

export async function getAllBoards(): Promise<BoardRecord[]> {
  return db.boards.toArray();
}