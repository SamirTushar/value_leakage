import { formatCr, formatPct } from '../utils/formatCurrency';

export default function TotalDisplay({ total, totalPctOfRevenue, hasDIO, gap1Only, onViewBreakdown }) {
  // gap1Only: only Gap 1 exists — don't show misleading total
  if (gap1Only) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-500 leading-relaxed">
          Forecast accuracy suggests significant downstream costs.<br />
          Enter DIO or inventory value to see the full picture.
        </p>
      </div>
    );
  }

  // Before enough data
  if (!hasDIO) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-3xl font-bold text-gray-200 mb-1">₹ —</p>
        <p className="text-xs text-gray-400">Enter DIO to size the first gap</p>
      </div>
    );
  }

  if (total == null) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <p className="text-5xl font-bold text-teal-700 mb-1">
        {formatCr(total)}
      </p>
      <p className="text-sm text-gray-400 mb-0.5">estimated annual value leakage</p>
      {totalPctOfRevenue != null && (
        <p className="text-sm text-gray-400">
          {formatPct(totalPctOfRevenue)} of revenue
        </p>
      )}
      <button
        onClick={onViewBreakdown}
        className="mt-4 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
      >
        View Breakdown →
      </button>
    </div>
  );
}
