import { Eraser as EraserIcon } from 'lucide-react';

export default function EraserTool() {
  return (
    <button
      type="button"
      title="Eraser active"
      className="rounded-full p-2 text-gray-600"
    >
      <EraserIcon className="h-4 w-4" />
    </button>
  );
}