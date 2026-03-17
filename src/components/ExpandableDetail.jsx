import { useState } from 'react';

export default function ExpandableDetail({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
      >
        <span className="text-[10px]">{open ? '▼' : '▶'}</span>
        {open ? 'Hide detail' : 'Show detail'}
      </button>
      {open && (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}
