'use client';

import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '../../../store/hooks';
import {
  exportElementsToPng,
  exportElementsToSvg,
  exportToJson,
  type PngScale,
} from '../../../lib/exportEngine';

type ExportFormat = 'png' | 'svg' | 'json';

interface ModelExportProps {
  onClose: () => void;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
  { value: 'json', label: 'JSON' },
];

const SCALE_OPTIONS: PngScale[] = [1, 2, 3];

export default function ModelExport({ onClose }: ModelExportProps) {
  const elements = useAppSelector((state) => state.canvas.elements);
  const selectedElementIds = useAppSelector((state) => state.canvas.selectedElementIds);
  const [format, setFormat] = useState<ExportFormat>('png');
  const [transparent, setTransparent] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [scale, setScale] = useState<PngScale>(1);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportElements = selectedOnly
    ? elements.filter((element) => selectedElementIds.includes(element.id))
    : elements;

  const handleDownload = async () => {
    setIsExporting(true);
    setError(null);

    try {
      if (format === 'png') {
        await exportElementsToPng(exportElements, { scale, transparent });
      } else if (format === 'svg') {
        exportElementsToSvg(exportElements, { transparent });
      } else {
        exportToJson(exportElements);
      }
      onClose();
    } catch (exportError) {
      console.error('[OpenBoard] Export gagal:', exportError);
      setError('Export gagal. Coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto border-4 border-black bg-white shadow-hard-lg"
      >
        <div className="flex items-center justify-between border-b-4 border-black bg-accent-pink px-5 py-4">
          <h2 id="export-title" className="font-body text-xl font-semibold text-white">
            Export &amp; Simpan Papan
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-black bg-white p-1 cursor-pointer"
            aria-label="Tutup modal export"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 border-b-4 border-black px-5 py-5">
          <fieldset>
            <legend className="mb-3 uppercase text-xl font-light text-gray-600">Format export</legend>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={format === option.value}
                  onClick={() => setFormat(option.value)}
                  className={`border-4 border-black px-3 py-3 font-bold cursor-pointer ${format === option.value ? 'bg-accent-blue text-white' : 'bg-white text-black'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="uppercase text-xl font-light text-gray-600">Opsi</legend>
            <label className="flex items-center gap-2 font-display text-sm font-bold text-gray-600">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(event) => setTransparent(event.target.checked)}
                className="h-5 w-5 cursor-pointer accent-blue-600"
              />
              Latar belakang transparan
            </label>
            <label className="flex items-center gap-2 font-display text-sm font-bold text-gray-600">
              <input
                type="checkbox"
                checked={selectedOnly}
                disabled={selectedElementIds.length === 0}
                onChange={(event) => setSelectedOnly(event.target.checked)}
                className="h-5 w-5 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
              />
              Hanya elemen terpilih
              {selectedElementIds.length === 0 && <span className="font-normal">(belum ada pilihan)</span>}
            </label>
          </fieldset>

          {format === 'png' && (
            <fieldset>
              <legend className="mb-3 uppercase text-xl font-light text-gray-600">Skala gambar</legend>
              <div className="grid grid-cols-3 gap-3">
                {SCALE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={scale === option}
                    onClick={() => setScale(option)}
                    className={`border-4 border-black px-3 py-3 font-bold cursor-pointer ${scale === option ? 'bg-accent-peach' : 'bg-white'}`}
                  >
                    {option}x{option === 2 ? ' (HD)' : ''}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <p className="font-mono text-xs text-gray-600">
            PNG diekspor dari seluruh board, termasuk objek di luar viewport. {exportElements.length} elemen akan diproses.
          </p>
          {error && <p className="font-mono text-sm font-bold text-red-600" role="alert">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 px-5 py-5">
          <button
            type="button"
            onClick={onClose}
            className="border-4 border-black bg-white px-5 py-3 font-display cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 border-4 border-black bg-accent-blue px-5 py-3 font-display text-white cursor-pointer disabled:cursor-wait disabled:opacity-60"
          >
            <Download aria-hidden="true" />
            {isExporting ? 'Memproses...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
