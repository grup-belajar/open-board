import { useState } from 'react';
import { StickyNote as StickyNoteIcon } from 'lucide-react';

export default function StickyNote() {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');

  return (
    <div className="flex min-h-[120px] w-[160px] flex-col rounded-sm bg-yellow-200 p-2 shadow-md">
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setEditing(false)}
          className="h-full w-full resize-none bg-transparent text-sm outline-none"
          placeholder="Tulis catatan..."
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex h-full min-h-[90px] w-full cursor-text items-start justify-start text-left text-sm"
        >
          {text || <StickyNoteIcon className="h-4 w-4 text-yellow-600" />}
        </button>
      )}
    </div>
  );
}