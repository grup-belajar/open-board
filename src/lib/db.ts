import Dexie, { Table } from 'dexie';
import type { CanvasElement } from '../store/slices/canvasSlice';

export interface BoardRecord {
  id: string;
  name: string;
  elements: CanvasElement[];
  updatedAt: number;
  createdAt: number;
}

export interface BoardLoadResult {
  board: BoardRecord | undefined;
  indexedDbConfirmed: boolean;
  recoveryJournalAvailable: boolean;
}

interface AutosaveRecoveryResult {
  board: BoardRecord;
  indexedDbConfirmed: boolean;
  recoveryJournalAvailable: boolean;
}

interface AutosaveJournalRecord {
  boardId: string;
  elements: CanvasElement[];
  updatedAt: number;
}

const AUTOSAVE_JOURNAL_PREFIX = 'openboard:autosave:';
const journalTimestamps = new Map<string, number>();
const warnedJournalFailures = new Set<string>();

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

function getAutosaveJournalKey(boardId: string): string {
  return `${AUTOSAVE_JOURNAL_PREFIX}${encodeURIComponent(boardId)}`;
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isAutosaveJournalRecord(value: unknown): value is AutosaveJournalRecord {
  if (typeof value !== 'object' || value === null) return false;

  const record = value as Partial<AutosaveJournalRecord>;
  return (
    typeof record.boardId === 'string' &&
    Array.isArray(record.elements) &&
    typeof record.updatedAt === 'number' &&
    Number.isFinite(record.updatedAt)
  );
}

function readAutosaveJournal(boardId: string): AutosaveJournalRecord | undefined {
  const storage = getLocalStorage();
  if (!storage) return undefined;

  const key = getAutosaveJournalKey(boardId);
  try {
    const value = storage.getItem(key);
    if (!value) return undefined;

    const parsed: unknown = JSON.parse(value);
    if (isAutosaveJournalRecord(parsed) && parsed.boardId === boardId) return parsed;

    storage.removeItem(key);
  } catch {
    try {
      storage.removeItem(key);
    } catch {
      // A corrupt or inaccessible journal must not prevent opening the board.
    }
  }

  return undefined;
}

function warnJournalFailure(boardId: string, error?: unknown): void {
  if (warnedJournalFailures.has(boardId)) return;
  warnedJournalFailures.add(boardId);
  console.warn(`[OpenBoard] Recovery journal board ${boardId} tidak tersedia.`, error);
}

/**
 * Tulis snapshot ke localStorage secara sinkron sebelum autosave IndexedDB.
 * Nilai null berarti browser menolak penulisan journal.
 */
export function writeAutosaveJournal(
  boardId: string,
  elements: CanvasElement[]
): number | null {
  const storage = getLocalStorage();
  if (!storage) {
    warnJournalFailure(boardId);
    return null;
  }

  const existingTimestamp = readAutosaveJournal(boardId)?.updatedAt ?? 0;
  const lastTimestamp = journalTimestamps.get(boardId) ?? 0;
  const updatedAt = Math.max(Date.now(), existingTimestamp + 1, lastTimestamp + 1);

  try {
    storage.setItem(
      getAutosaveJournalKey(boardId),
      JSON.stringify({ boardId, elements, updatedAt } satisfies AutosaveJournalRecord)
    );
    journalTimestamps.set(boardId, updatedAt);
    return updatedAt;
  } catch (error) {
    warnJournalFailure(boardId, error);
    return null;
  }
}

function clearAutosaveJournal(boardId: string, expectedTimestamp?: number): void {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    if (expectedTimestamp !== undefined) {
      const current = readAutosaveJournal(boardId);
      if (current?.updatedAt !== expectedTimestamp) return;
    }

    storage.removeItem(getAutosaveJournalKey(boardId));
  } catch {
    // A stale journal is harmless and will be checked against IndexedDB later.
  }
}

function readAllAutosaveJournals(): AutosaveJournalRecord[] {
  const storage = getLocalStorage();
  if (!storage) return [];

  const records: AutosaveJournalRecord[] = [];
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith(AUTOSAVE_JOURNAL_PREFIX)) continue;

      try {
        const value = storage.getItem(key);
        const parsed: unknown = value ? JSON.parse(value) : undefined;
        if (
          isAutosaveJournalRecord(parsed) &&
          key === getAutosaveJournalKey(parsed.boardId)
        ) {
          records.push(parsed);
        } else {
          storage.removeItem(key);
          index -= 1;
        }
      } catch {
        storage.removeItem(key);
        index -= 1;
      }
    }
  } catch {
    return records;
  }

  return records;
}

function clearAllAutosaveJournals(): void {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith(AUTOSAVE_JOURNAL_PREFIX)) storage.removeItem(key);
    }
  } catch {
    // Board records remain authoritative if browser storage is unavailable.
  }
}

async function recoverAutosaveJournal(
  journal: AutosaveJournalRecord,
  existing?: BoardRecord
): Promise<AutosaveRecoveryResult> {
  if (existing && journal.updatedAt < existing.updatedAt) {
    clearAutosaveJournal(journal.boardId, journal.updatedAt);
    return {
      board: existing,
      indexedDbConfirmed: true,
      recoveryJournalAvailable: false,
    };
  }

  const recovered: BoardRecord = {
    id: journal.boardId,
    name: existing?.name ?? 'Untitled Board',
    elements: journal.elements,
    createdAt: existing?.createdAt ?? journal.updatedAt,
    updatedAt: journal.updatedAt,
  };

  if (!db) {
    return {
      board: recovered,
      indexedDbConfirmed: false,
      recoveryJournalAvailable: true,
    };
  }

  try {
    await db.boards.put(recovered);
    clearAutosaveJournal(journal.boardId, journal.updatedAt);
    return {
      board: recovered,
      indexedDbConfirmed: true,
      recoveryJournalAvailable: false,
    };
  } catch (error) {
    console.error(`[OpenBoard] Recovery board ${journal.boardId} gagal:`, error);
    return {
      board: recovered,
      indexedDbConfirmed: false,
      recoveryJournalAvailable: true,
    };
  }
}

/**
 * Simpan (create/update) satu board. Dipanggil oleh middleware autosave
 * maupun secara manual (mis. saat import file JSON).
 */
export async function saveBoard(
  id: string,
  elements: CanvasElement[],
  name?: string,
  journalTimestamp?: number
): Promise<void> {
  if (!db) throw new Error('IndexedDB tidak tersedia di browser ini.');
  const existing = await db.boards.get(id);
  const currentJournal = journalTimestamp === undefined
    ? undefined
    : readAutosaveJournal(id);
  if (
    journalTimestamp !== undefined &&
    ((currentJournal && currentJournal.updatedAt > journalTimestamp) ||
      (existing && existing.updatedAt > journalTimestamp))
  ) {
    return;
  }

  const updatedAt = journalTimestamp ?? Date.now();
  await db.boards.put({
    id,
    name: name ?? existing?.name ?? 'Untitled Board',
    elements,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt,
  });

  if (journalTimestamp !== undefined) {
    clearAutosaveJournal(id, journalTimestamp);
  }
}

export async function loadBoard(id: string): Promise<BoardRecord | undefined> {
  const result = await loadBoardWithStatus(id);
  return result.board;
}

export async function loadBoardWithStatus(id: string): Promise<BoardLoadResult> {
  if (!db) {
    return {
      board: undefined,
      indexedDbConfirmed: false,
      recoveryJournalAvailable: false,
    };
  }

  const journal = readAutosaveJournal(id);
  const existing = await db.boards.get(id);
  if (!journal) {
    return {
      board: existing,
      indexedDbConfirmed: existing !== undefined,
      recoveryJournalAvailable: false,
    };
  }

  return recoverAutosaveJournal(journal, existing);
}

/** Semua board, diurutkan dari yang paling baru diedit. */
export async function getAllBoards(): Promise<BoardRecord[]> {
  if (!db) return [];
  const boards = new Map((await db.boards.toArray()).map((board) => [board.id, board]));

  for (const journal of readAllAutosaveJournals()) {
    const recovery = await recoverAutosaveJournal(journal, boards.get(journal.boardId));
    boards.set(recovery.board.id, recovery.board);
  }

  return Array.from(boards.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function renameBoard(id: string, name: string): Promise<void> {
  if (!db) return;
  await loadBoard(id);
  await db.boards.update(id, { name, updatedAt: Date.now() });
}

export async function deleteBoard(id: string): Promise<void> {
  if (!db) return;
  clearAutosaveJournal(id);
  await db.boards.delete(id);
}

/** Dipakai tombol "Bersihkan Semua" di landing page. */
export async function clearAllBoards(): Promise<void> {
  if (!db) return;
  clearAllAutosaveJournals();
  await db.boards.clear();
}

/** Generate id board baru yang unik, untuk tombol "Buat Papan Baru" / import JSON. */
export function generateBoardId(): string {
  return `board-${crypto.randomUUID()}`;
}
