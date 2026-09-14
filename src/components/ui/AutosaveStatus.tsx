'use client';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { retryAutosave, type BoardAutosaveStatus } from '../../store/slices/autosaveSlice';

interface AutosaveStatusProps {
  boardId: string;
  className?: string;
}

const IDLE_STATUS: BoardAutosaveStatus = {
  phase: 'idle',
  requestId: 0,
  journalAvailable: null,
};

const STATUS_LABELS: Record<BoardAutosaveStatus['phase'], string> = {
  idle: 'Belum ada perubahan',
  saving: 'Menyimpan…',
  saved: 'Tersimpan',
  error: 'Gagal menyimpan',
};

const STATUS_COLORS: Record<BoardAutosaveStatus['phase'], string> = {
  idle: 'text-on-surface',
  saving: 'text-secondary',
  saved: 'text-accent-green',
  error: 'text-accent-red',
};

function getStatusDetail(status: BoardAutosaveStatus): string {
  if (status.phase === 'idle') return 'Perubahan akan disimpan otomatis.';
  if (status.phase === 'saving' && status.journalAvailable === false) {
    return 'Salinan pemulihan tidak tersedia.';
  }
  if (status.phase === 'saved' && status.journalAvailable === false) {
    return 'Board tersimpan di browser, tetapi salinan pemulihan tidak tersedia.';
  }
  if (status.phase === 'error' && status.journalAvailable) {
    return 'Penyimpanan utama gagal. Salinan pemulihan tersedia.';
  }
  if (status.phase === 'error') {
    return 'Penyimpanan utama dan salinan pemulihan gagal. Periksa ruang browser lalu coba lagi.';
  }

  return '';
}

export default function AutosaveStatus({ boardId, className = '' }: AutosaveStatusProps) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(
    (state) => state.autosave.byBoardId[boardId] ?? IDLE_STATUS
  );
  const detail = getStatusDetail(status);

  return (
    <div
      role="group"
      aria-label="Status autosave"
      className={`flex min-w-0 flex-col gap-2 ${className}`}
    >
      <div
        role={status.phase === 'error' ? 'alert' : 'status'}
        aria-atomic="true"
        className="min-w-0"
      >
        <p className={`break-words font-mono text-label-sm font-bold ${STATUS_COLORS[status.phase]}`}>
          {STATUS_LABELS[status.phase]}
        </p>
        {detail && (
          <p className="mt-1 text-xs leading-4 text-on-surface-variant">
            {detail}
          </p>
        )}
      </div>
      {status.phase === 'error' && (
        <button
          type="button"
          onClick={() => dispatch(retryAutosave({ boardId }))}
          className="self-start border-2 border-primary bg-accent-blue px-2 py-1 font-mono text-xs font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}
