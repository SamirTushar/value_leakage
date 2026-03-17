import { useState } from 'react';

export default function AnimatedExpandable({ title, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 py-3 text-left cursor-pointer group"
      >
        <span
          className="text-gray-400 text-xs transition-transform duration-200"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}
        >
          ▶
        </span>
        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
          {title}
        </span>
      </button>
      <div className={`expandable-grid ${open ? 'open' : ''}`}>
        <div className="expandable-inner">
          <div className="pb-4 space-y-3">
            {badge && (
              <span
                className="inline-block text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: badge.color + '18', color: badge.color }}
              >
                {badge.label}
              </span>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
