import { formatCr, formatPct } from '../utils/formatCurrency';

export default function TotalDisplay({ total, totalPctOfRevenue, hasDIO, onViewBreakdown }) {
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
