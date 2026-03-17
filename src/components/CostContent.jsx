import { formatCr } from '../utils/formatCurrency';
import CostChart from './CostChart';
import ExpandableDetail from './ExpandableDetail';

export default function CostContent({ inputs, results, onInputChange }) {
  const { costs, totalCost, costAsPctRevenue } = results;

  if (costs.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        Enter company financials to see cost calculations.
      </p>
    );
  }

  const overrideKeys = ['overrideCarryingCost', 'overrideWriteOff', 'overrideFreight'];

  return (
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
          {/* Override input */}
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

      {/* Total */}
      <div className="border-t border-gray-200 pt-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-gray-800">
          Total Annual Leakage
        </span>
        <div className="text-right">
          <span className="text-lg font-bold text-teal-700">
            {formatCr(totalCost)}
          </span>
          {costAsPctRevenue != null && (
            <span className="text-xs text-gray-400 ml-2">
              {costAsPctRevenue}% of revenue
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <CostChart items={costs} />

      <ExpandableDetail>
        <p>Carrying cost rate includes: cost of capital (~10%), warehousing (~5%), insurance (~2%), handling (~3%).</p>
        <p>Write-off rates vary: FMCG ~1.5%, Pharma ~3%, Manufacturing ~1%.</p>
        <p>Use the Override fields to enter actual data from the company. This changes the conviction from "Estimated" to "Override."</p>
      </ExpandableDetail>
    </div>
  );
}
