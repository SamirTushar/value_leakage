import AssumedBadge from './AssumedBadge';
import ExpandableDetail from './ExpandableDetail';

export default function CompensationContent({ inputs, results, narratives, onInputChange }) {
  return (
    <div className="space-y-3">
      {/* Fill rate input */}
      <div className="flex items-baseline gap-2">
        <label className="text-[10px] uppercase tracking-wider text-gray-400">Fill Rate</label>
        <input
          type="number"
          value={inputs.fillRate ?? ''}
          onChange={(e) => onInputChange('fillRate', e.target.value === '' ? null : Number(e.target.value))}
          placeholder={results.fillRate ?? 'e.g. 97'}
          className="input-field w-20 text-sm font-semibold text-center"
        />
        <span className="text-sm text-gray-500">%</span>
        <AssumedBadge isAssumed={results.assumed.fillRate} />
      </div>

      {/* Compensation bullet items */}
      {narratives.compensationItems.length > 0 && (
        <ul className="space-y-2">
          {narratives.compensationItems.map((item, i) => (
            <li key={i} className="text-sm text-gray-600 flex gap-2">
              <span className="text-amber-600 mt-0.5 shrink-0">&bull;</span>
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* Contradiction warning */}
      {narratives.contradiction && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-800 flex gap-2">
            <span className="shrink-0">&#9888;&#65039;</span>
            {narratives.contradiction}
          </div>
        </div>
      )}

      {/* Insight */}
      {narratives.compensationInsight && (
        <p className="text-sm font-medium text-gray-700 italic">
          {narratives.compensationInsight}
        </p>
      )}

      <ExpandableDetail>
        <p>Compensation mechanisms mask the root cause. High fill rate + low forecast accuracy = expensive safety stock.</p>
        <p>Each 1% of fill rate above 95% costs exponentially more in inventory investment.</p>
      </ExpandableDetail>
    </div>
  );
}
