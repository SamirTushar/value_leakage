import { formatCr } from '../utils/formatCurrency';

export default function ROISummary({ inputs, results, onInputChange }) {
  const { costs, totalCost, annualSavings, capitalFreed, gapClosurePct } = results;

  if (costs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-8 text-center">
          <p className="text-sm text-gray-400">Enter company data to see ROI projections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 px-6 py-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          ROI Summary{inputs.companyName ? `: ${inputs.companyName}` : ''}
        </h2>

        {/* Annual Value Leakage */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Annual Value Leakage
          </h3>
          <div className="space-y-2">
            {costs.map((c, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{c.name}</span>
                <span className="font-medium text-gray-900">{formatCr(c.amount)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold">
              <span className="text-gray-800">Total Annual Leakage</span>
              <span className="text-teal-700">{formatCr(totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Gap Closure */}
        <div className="mt-6 bg-teal-50 rounded-lg px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              If we close
            </h3>
            <input
              type="number"
              value={gapClosurePct ?? ''}
              onChange={(e) => onInputChange('gapClosurePct', e.target.value === '' ? null : Number(e.target.value))}
              className="input-field w-16 text-sm font-bold text-center text-teal-800"
            />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              % of the gap
            </h3>
          </div>
          <p className="text-xs text-teal-600 mb-4">
            Conservative estimate — better planning won't eliminate all excess, but {gapClosurePct}% reduction is achievable in Year 1.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-teal-500 mb-0.5">
                Annual Savings
              </div>
              <div className="text-2xl font-bold text-teal-800">
                {formatCr(annualSavings)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-teal-500 mb-0.5">
                Capital Freed (one-time)
              </div>
              <div className="text-2xl font-bold text-teal-800">
                {formatCr(capitalFreed)}
              </div>
            </div>
          </div>
        </div>

        {/* Investment Placeholder */}
        <div className="mt-6 border border-dashed border-gray-300 rounded-lg px-5 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Investment vs Return
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Solution cost (annual)</div>
              <div className="font-medium text-gray-400 mt-1">TBD</div>
            </div>
            <div>
              <div className="text-gray-500">Payback period</div>
              <div className="font-medium text-gray-400 mt-1">TBD</div>
            </div>
            <div>
              <div className="text-gray-500">3-Year ROI</div>
              <div className="font-medium text-gray-400 mt-1">TBD</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Solution cost is placeholder. In the live tool, this will be editable.
          </p>
        </div>
      </div>
    </div>
  );
}
