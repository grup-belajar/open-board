import { Highlighter as HighlighterIcon } from 'lucide-react';

export default function HighlighterTool() {
  return (
    <button
      type="button"
      title="Highlighter"
      className="rounded-full p-2 text-gray-600"
    >
      <HighlighterIcon className="h-4 w-4" />
    </button>
  );
}