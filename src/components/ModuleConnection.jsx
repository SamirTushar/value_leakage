export default function ModuleConnection({ connections, selectedIndex, onSelect }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 px-6 py-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
        Connection to Modules
      </h3>
      <div className="space-y-2">
        {connections.map((c, i) => {
          const isSelected = i === selectedIndex;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-white border border-teal-200 shadow-sm'
                  : 'hover:bg-white/60'
              }`}
            >
              <span className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                isSelected ? 'border-teal-600' : 'border-gray-300'
              }`}>
                {isSelected && <span className="w-2 h-2 rounded-full bg-teal-600" />}
              </span>
              <span className={`text-sm italic shrink-0 w-48 ${isSelected ? 'text-gray-700' : 'text-gray-500'}`}>
                &ldquo;{c.question}&rdquo;
              </span>
              <span className="text-gray-300">&rarr;</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-teal-700' : 'text-gray-500'}`}>
                {c.module}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
