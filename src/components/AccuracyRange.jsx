export default function AccuracyRange({ accuracy, typical, best }) {
  const maxScale = Math.max(accuracy, typical) * 1.3;
  const bestPct = (best / maxScale) * 100;
  const typicalPct = (typical / maxScale) * 100;
  const youPct = (accuracy / maxScale) * 100;

  return (
    <div>
      <div className="relative h-6 bg-gray-100 rounded-full overflow-visible">
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${youPct}%`,
            background: accuracy > typical
              ? 'linear-gradient(90deg, #FEF3C7 0%, #FDE68A 50%, #F59E0B 100%)'
              : 'linear-gradient(90deg, #DBEAFE 0%, #93C5FD 100%)',
          }}
        />
        <div className="absolute top-0 h-full" style={{ left: `${bestPct}%`, transform: 'translateX(-50%)' }}>
          <div className="w-0.5 h-full bg-green-500" />
        </div>
        <div className="absolute top-0 h-full" style={{ left: `${typicalPct}%`, transform: 'translateX(-50%)' }}>
          <div className="w-0.5 h-full bg-gray-400" />
        </div>
        <div className="absolute top-0 h-full" style={{ left: `${youPct}%`, transform: 'translateX(-50%)' }}>
          <div className="w-2 h-full bg-amber-500 rounded-full" />
        </div>
      </div>
      <div className="relative h-5 mt-1 text-[10px] text-gray-500">
        <span className="absolute text-green-600 font-medium" style={{ left: `${bestPct}%`, transform: 'translateX(-50%)' }}>
          {best}% best
        </span>
        <span className="absolute text-gray-500 font-medium" style={{ left: `${typicalPct}%`, transform: 'translateX(-50%)' }}>
          {typical}% typical
        </span>
        <span className="absolute text-amber-600 font-bold" style={{ left: `${youPct}%`, transform: 'translateX(-50%)' }}>
          {accuracy}%
        </span>
      </div>
    </div>
  );
}
