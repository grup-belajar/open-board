import { useEffect, useRef, useState } from 'react';

export default function TextTool() {
  const [isActive, setIsActive] = useState(false);
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isActive) ref.current?.focus();
  }, [isActive]);

  if (!isActive) return null;

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => setIsActive(false)}
      className="resize-none border border-gray-300 bg-white p-1 text-sm"
    />
  );
}