import AssumedBadge from './AssumedBadge';
import ExpandableDetail from './ExpandableDetail';

const ACCURACY_LEVELS = [
  { value: '', label: 'Select level...' },
  { value: 'SKU-Week', label: 'SKU-Week' },
  { value: 'SKU-Month', label: 'SKU-Month' },
  { value: 'Product Family-Month', label: 'Product Family-Month' },
  { value: 'National-Month', label: 'National-Month' },
];

export default function CauseContent({ inputs, results, narratives, benchmarks, onInputChange }) {
  const accuracy = results.forecastAccuracy;
  const typical = benchmarks?.typicalMAPE?.value;
  const best = benchmarks?.bestInClassMAPE?.value;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3 flex-wrap">
        <div className="flex items-baseline gap-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 mr-1">
            Forecast Accuracy
          </label>
          <input
            type="number"
            value={inputs.forecastAccuracy ?? ''}
            onChange={(e) => onInputChange('forecastAccuracy', e.target.value === '' ? null : Number(e.target.value))}
            placeholder={typical ?? 'e.g. 45'}
            className="input-field w-20 text-sm font-semibold text-center"
          />
          <span className="text-sm text-gray-500">% MAPE</span>
          <AssumedBadge isAssumed={results.assumed.forecastAccuracy} />
        </div>

        <div className="flex items-center gap-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400">Level</label>
          <select
            value={inputs.accuracyLevel || ''}
            onChange={(e) => onInputChange('accuracyLevel', e.target.value)}
            className="input-field text-xs py-1"
          >
            {ACCURACY_LEVELS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Accuracy range bar */}
      {typical != null && best != null && accuracy != null && (
        <AccuracyRange accuracy={accuracy} typical={typical} best={best} />
      )}

      {/* Auto-generated narrative */}
      {narratives.causeNarrative && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {narratives.causeNarrative}
        </p>
      )}

      <ExpandableDetail>
        <p>MAPE (Mean Absolute Percentage Error) measures forecast accuracy at the specified granularity.</p>
        {typical != null && <p>Industry typical: {typical}% — Best-in-class: {best}%</p>}
        <p>Lower is better. A 10-point improvement typically reduces safety stock by 15-20%.</p>
      </ExpandableDetail>
    </div>
  );
}

function AccuracyRange({ accuracy, typical, best }) {
  // Scale: 0% (best) to max(accuracy, typical) * 1.3
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
