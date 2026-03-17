import { formatCr } from '../utils/formatCurrency';
import DIORange from './DIORange';
import AssumedBadge from './AssumedBadge';
import ExpandableDetail from './ExpandableDetail';

const FOCUS_OPTIONS = [
  { value: 'dio', label: 'DIO / Excess Inventory' },
  { value: 'aging', label: 'Aging / Near-Expiry' },
  { value: 'fillRate', label: 'Fill Rate / Service Level' },
  { value: 'oee', label: 'OEE' },
];

export default function EffectContent({ inputs, results, narratives, onInputChange }) {
  const focus = inputs.diagnosticFocus || 'dio';

  return (
    <div className="space-y-3">
      {/* Diagnostic focus selector */}
      <div className="flex items-center gap-2">
        <label className="text-[10px] uppercase tracking-wider text-gray-400">
          Diagnostic focus
        </label>
        <select
          value={focus}
          onChange={(e) => onInputChange('diagnosticFocus', e.target.value)}
          className="input-field text-xs py-1"
        >
          {FOCUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {focus === 'dio' && <DIOFocusContent inputs={inputs} results={results} onInputChange={onInputChange} />}
      {focus === 'aging' && <AgingFocusContent inputs={inputs} results={results} onInputChange={onInputChange} />}
      {focus === 'fillRate' && <FillRateFocusContent inputs={inputs} results={results} onInputChange={onInputChange} />}
      {focus === 'oee' && <OEEFocusContent inputs={inputs} onInputChange={onInputChange} />}

      {/* Narrative */}
      {narratives.effectNarrative && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {narratives.effectNarrative}
        </p>
      )}
    </div>
  );
}

function DIOFocusContent({ inputs, results, onInputChange }) {
  const { effectiveDIO, medianDIO, bestDIO, dioGap, excessInventory } = results;

  return (
    <>
      <div className="flex items-baseline gap-4">
        <div className="flex items-baseline gap-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 mr-1">DIO</label>
          <input
            type="number"
            value={inputs.dio ?? ''}
            onChange={(e) => onInputChange('dio', e.target.value === '' ? null : Number(e.target.value))}
            placeholder={effectiveDIO ?? 'e.g. 78'}
            className="input-field w-20 text-lg font-bold text-center"
          />
          <span className="text-sm text-gray-500">days</span>
          <AssumedBadge isAssumed={results.assumed.dio} />
        </div>
        {medianDIO != null && (
          <div className="text-sm text-gray-500">
            Industry median: <span className="font-medium">{medianDIO} days</span>
          </div>
        )}
        {dioGap != null && dioGap > 0 && (
          <div className="text-sm text-red-600 font-medium">
            Gap: {dioGap} days above median
          </div>
        )}
      </div>

      {effectiveDIO != null && medianDIO != null && bestDIO != null && (
        <DIORange dio={effectiveDIO} medianDIO={medianDIO} bestDIO={bestDIO} />
      )}

      {excessInventory != null && (
        <div className="px-3 py-2 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-800">
            Excess inventory: <span className="font-bold">{formatCr(excessInventory)}</span>
          </span>
        </div>
      )}

      <ExpandableDetail>
        <p>DIO = (Inventory ÷ COGS) × 365</p>
        {results.effectiveCOGS != null && inputs.inventory != null && (
          <p>= ({formatCr(inputs.inventory)} ÷ {formatCr(results.effectiveCOGS)}) × 365 = {effectiveDIO} days</p>
        )}
        {excessInventory != null && (
          <p>Excess = ({effectiveDIO} − {medianDIO}) × ({formatCr(results.effectiveCOGS)} ÷ 365) = {formatCr(excessInventory)}</p>
        )}
      </ExpandableDetail>
    </>
  );
}

function AgingFocusContent({ inputs, results, onInputChange }) {
  const { effectiveDIO, medianDIO, nearExpiryValue } = results;

  return (
    <>
      <div className="flex items-baseline gap-4">
        {effectiveDIO != null && (
          <>
            <div>
              <span className="text-2xl font-bold text-gray-900">{effectiveDIO}</span>
              <span className="text-sm text-gray-500 ml-1">days DIO</span>
            </div>
            {medianDIO != null && (
              <div className="text-sm text-gray-500">
                Pharma median: <span className="font-medium">{medianDIO} days</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <label className="text-[10px] uppercase tracking-wider text-gray-400">Near-expiry %</label>
        <input
          type="number"
          value={inputs.nearExpiryPct ?? ''}
          onChange={(e) => onInputChange('nearExpiryPct', e.target.value === '' ? null : Number(e.target.value))}
          placeholder="e.g. 18"
          className="input-field w-20 text-sm text-center"
        />
        <span className="text-sm text-gray-500">% of inventory</span>
      </div>

      {nearExpiryValue != null && inputs.nearExpiryPct != null && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
          <div className="text-sm font-semibold text-red-800 mb-1">
            {inputs.nearExpiryPct}% of inventory is within 6 months of expiry
          </div>
          <div className="text-sm text-red-700">
            Near-expiry inventory: <span className="font-bold">{formatCr(nearExpiryValue)}</span>
          </div>
        </div>
      )}
    </>
  );
}

function FillRateFocusContent({ inputs, results, onInputChange }) {
  const typical = 96; // benchmark
  const fillRate = inputs.fillRate;
  const gap = fillRate != null ? typical - fillRate : null;

  return (
    <>
      <div className="flex items-baseline gap-2">
        <label className="text-[10px] uppercase tracking-wider text-gray-400">Fill Rate</label>
        <input
          type="number"
          value={fillRate ?? ''}
          onChange={(e) => onInputChange('fillRate', e.target.value === '' ? null : Number(e.target.value))}
          placeholder="e.g. 92"
          className="input-field w-20 text-lg font-bold text-center"
        />
        <span className="text-sm text-gray-500">%</span>
        <span className="text-sm text-gray-400 ml-2">Industry typical: {typical}%</span>
        {gap != null && gap > 0 && (
          <span className="text-sm text-red-600 font-medium ml-2">
            Gap: {gap} points below typical
          </span>
        )}
      </div>
    </>
  );
}

function OEEFocusContent({ inputs, onInputChange }) {
  return (
    <>
      <div className="flex items-baseline gap-2">
        <label className="text-[10px] uppercase tracking-wider text-gray-400">OEE</label>
        <input
          type="number"
          value={inputs.oee ?? ''}
          onChange={(e) => onInputChange('oee', e.target.value === '' ? null : Number(e.target.value))}
          placeholder="e.g. 65"
          className="input-field w-20 text-lg font-bold text-center"
        />
        <span className="text-sm text-gray-500">%</span>
        <span className="text-sm text-gray-400 ml-2">World-class: 85%</span>
      </div>

      <div className="flex gap-4 mt-2">
        {[
          { key: 'oeeAvailability', label: 'Availability' },
          { key: 'oeePerformance', label: 'Performance' },
          { key: 'oeeQuality', label: 'Quality' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1">
            <label className="text-[10px] text-gray-400">{label}</label>
            <input
              type="number"
              value={inputs[key] ?? ''}
              onChange={(e) => onInputChange(key, e.target.value === '' ? null : Number(e.target.value))}
              placeholder="%"
              className="input-field w-16 text-xs text-center"
            />
            <span className="text-xs text-gray-400">%</span>
          </div>
        ))}
      </div>
    </>
  );
}
