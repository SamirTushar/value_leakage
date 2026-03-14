export default function BenchmarkBar({ value, best, typical, worst = 100, unit = '%', lowerIsBetter = true }) {
  if (value == null || best == null || typical == null) return null;

  // Normalize positions to 0-100 range
  const range = worst - (lowerIsBetter ? 0 : worst);
  const min = lowerIsBetter ? Math.min(best, value) * 0.8 : 0;
  const max = lowerIsBetter ? worst : Math.max(worst, value) * 1.2;
  const span = max - min || 1;

  const pos = (v) => Math.max(0, Math.min(100, ((v - min) / span) * 100));

  const bestPos = pos(best);
  const typicalPos = pos(typical);
  const valuePos = pos(value);

  // Labels
  const bestLabel = `${best}${unit}`;
  const typicalLabel = `${typical}${unit}`;

  return (
    <div className="mt-1.5 mb-0.5">
      <div className="relative h-2 bg-gray-100 rounded-full overflow-visible">
        {/* Gradient bar: green to red for lower-is-better, reversed otherwise */}
        <div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${Math.min(bestPos, typicalPos)}%`,
            right: `${100 - Math.max(bestPos, typicalPos)}%`,
            background: 'linear-gradient(to right, #10B981, #F59E0B)',
          }}
        />
        {/* Best marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-emerald-500 rounded-full"
          style={{ left: `${bestPos}%` }}
        />
        {/* Typical marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-amber-500 rounded-full"
          style={{ left: `${typicalPos}%` }}
        />
        {/* User value dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-teal-600 border-2 border-white shadow-sm"
          style={{ left: `${valuePos}%`, marginLeft: '-6px' }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-400">
        <span style={{ marginLeft: `${Math.max(0, bestPos - 5)}%` }}>
          {bestLabel} best
        </span>
        <span style={{ marginRight: `${Math.max(0, 100 - typicalPos - 10)}%` }}>
          {typicalLabel} typical
        </span>
      </div>
    </div>
  );
}
