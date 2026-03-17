export default function StepCard({ step, label, color, children }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {step}
          </span>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color }}
          >
            {label}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
