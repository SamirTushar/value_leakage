const BENCHMARK_LABELS = {
  grossMargin: 'Gross Margin',
  medianDIO: 'Median DIO',
  bestInClassDIO: 'Best-in-class DIO',
  typicalMAPE: 'Typical MAPE',
  bestInClassMAPE: 'Best-in-class MAPE',
  freightPctOfCOGS: 'Freight % of COGS',
  expeditedPctOfFreight: 'Expedited % of Freight',
  carryingCostRate: 'Carrying Cost Rate',
  lostSalesRate: 'Lost Sales Rate',
  writeOffRate: 'Write-off Rate',
  typicalFillRate: 'Typical Fill Rate',
};

function formatBenchmarkValue(key, entry) {
  const v = entry.value;
  if (entry.unit === 'days') return `${v} days`;
  if (entry.unit === '%') {
    return v < 1 ? `${(v * 100).toFixed(1).replace(/\.0$/, '')}%` : `${v}%`;
  }
  return String(v);
}

export default function AssumptionsTable({ industry, benchmarks }) {
  if (!benchmarks || !industry) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-8 text-center">
          <p className="text-sm text-gray-400">Select an industry to see benchmarks.</p>
        </div>
      </div>
    );
  }

  const rows = Object.entries(benchmarks).map(([key, entry]) => ({
    metric: BENCHMARK_LABELS[key] || key,
    value: formatBenchmarkValue(key, entry),
    source: entry.source,
  }));

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">
            Industry Benchmarks: {industry}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            These benchmarks are used as fallback values when actual data isn't entered.
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Metric
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Value
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-3 text-sm text-gray-700">{row.metric}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.value}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
