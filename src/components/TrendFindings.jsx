import { formatCr } from '../utils/formatCurrency';

const BADGE_STYLES = {
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  positive: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const ICONS = {
  warning: '\u26A0\uFE0F',
  positive: '\u2705',
  info: '\u2139\uFE0F',
};

export default function TrendFindings({ findings, latestYear }) {
  if (!findings || findings.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Findings
      </h3>

      <div className="space-y-2">
        {findings.map((f, i) => (
          <div
            key={i}
            className={`px-4 py-3 rounded-lg border text-sm ${BADGE_STYLES[f.type]}`}
          >
            <span className="mr-2">{ICONS[f.type]}</span>
            {f.text}
          </div>
        ))}
      </div>

      {/* Latest year leakage summary */}
      {latestYear && latestYear.totalCost != null && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Annual Value Leakage ({latestYear.year})
          </h4>
          <div className="space-y-1">
            {latestYear.carryingCost != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Carrying cost</span>
                <span className="font-semibold text-teal-700">{formatCr(latestYear.carryingCost)}</span>
              </div>
            )}
            {latestYear.writeOffCost != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Write-off risk</span>
                <span className="font-semibold text-teal-700">{formatCr(latestYear.writeOffCost)}</span>
              </div>
            )}
            {latestYear.freightCost != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Freight premium</span>
                <span className="font-semibold text-teal-700">{formatCr(latestYear.freightCost)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="text-sm font-semibold text-gray-800">Total</span>
              <span className="text-lg font-bold text-teal-700">{formatCr(latestYear.totalCost)}/yr</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
