import { formatCr } from '../utils/formatCurrency';
import CostChart from './CostChart';
import AnimatedExpandable from './AnimatedExpandable';
import ModuleConnection from './ModuleConnection';

export default function ValueLeakageSection({ inputs, results, narratives, moduleOptions, onInputChange }) {
  const { costs, totalCost, costAsPctRevenue } = results;

  if (costs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Value Leakage
        </h2>
        <p className="text-sm text-gray-400 italic">
          Enter company financials to see cost calculations.
        </p>
      </div>
    );
  }

  const overrideKeys = ['overrideCarryingCost', 'overrideWriteOff', 'overrideFreight'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
        Value Leakage
      </h2>

      {/* Headline cost summary — clean, no overrides */}
      <div className="space-y-2">
        {costs.map((c, i) => (
          <div key={i} className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600">{c.name}</span>
            <span className="text-sm font-semibold text-teal-700 tabular-nums">
              {formatCr(c.amount)}/yr
            </span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-2 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-gray-800">Total</span>
          <div className="text-right">
            <span className="text-lg font-bold text-teal-700">
              {formatCr(totalCost)}/yr
            </span>
            {costAsPctRevenue != null && (
              <span className="text-xs text-gray-400 ml-2">
                ({costAsPctRevenue}% of revenue)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-3">
        <CostChart items={costs} />
      </div>

      {/* Expandable: How are these calculated? */}
      <AnimatedExpandable
        title="How are these calculated?"
        badge={{ label: 'Cost', color: '#0D9488' }}
      >
        <div className="space-y-3">
          {costs.map((c, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-800">{c.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{c.formula}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-teal-700">
                    {formatCr(c.amount)}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    c.conviction === 'Calculated'
                      ? 'bg-green-50 text-green-700'
                      : c.conviction === 'Solid'
                        ? 'bg-blue-50 text-blue-700'
                        : c.conviction === 'Override'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-amber-50 text-amber-700'
                  }`}>
                    {c.conviction}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <label className="text-[10px] text-gray-400">Override:</label>
                <input
                  type="number"
                  value={inputs[overrideKeys[i]] ?? ''}
                  onChange={(e) => onInputChange(overrideKeys[i], e.target.value === '' ? null : Number(e.target.value))}
                  placeholder="₹ Cr"
                  className="input-field w-24 text-xs py-0.5 text-center"
                />
              </div>
            </div>
          ))}

          <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
            <p>Carrying cost rate includes: cost of capital (~10%), warehousing (~5%), insurance (~2%), handling (~3%).</p>
            <p>Write-off rates vary: FMCG ~1.5%, Pharma ~3%, Manufacturing ~1%.</p>
            <p>Use the Override fields to enter actual data from the company. This changes the conviction from &ldquo;Estimated&rdquo; to &ldquo;Override.&rdquo;</p>
          </div>
        </div>
      </AnimatedExpandable>

      {/* Expandable: What's causing this leakage? */}
      <AnimatedExpandable
        title="What's causing this leakage?"
        badge={{ label: 'Module', color: '#6366F1' }}
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-600 space-y-1">
            <p>Follow the cost back to the root cause:</p>
            <div className="pl-2 border-l-2 border-gray-200 space-y-1 text-sm text-gray-600 my-2">
              <p className="font-semibold text-teal-700">{formatCr(totalCost)}/yr in total leakage</p>
              {results.excessInventory != null && (
                <p>↑ {formatCr(results.excessInventory)} sitting in excess inventory</p>
              )}
              {results.nearExpiryValue != null && (
                <p>↑ {formatCr(results.nearExpiryValue)} in near-expiry stock</p>
              )}
              <p>↑ Why? The demand signal isn't reliable</p>
              <p className="font-medium text-gray-800">ROOT: Fix the planning process, and the chain unwinds.</p>
            </div>
          </div>

          <ModuleConnection
            connections={moduleOptions}
            selectedIndex={inputs.selectedModuleAnswer}
            onSelect={(idx) => onInputChange('selectedModuleAnswer', idx)}
          />
        </div>
      </AnimatedExpandable>
    </div>
  );
}
