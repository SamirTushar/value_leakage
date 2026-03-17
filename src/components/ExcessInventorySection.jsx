import { formatCr } from '../utils/formatCurrency';
import DIORange from './DIORange';
import AccuracyRange from './AccuracyRange';
import AssumedBadge from './AssumedBadge';
import AnimatedExpandable from './AnimatedExpandable';

const FOCUS_OPTIONS = [
  { value: 'dio', label: 'DIO / Excess Inventory' },
  { value: 'aging', label: 'Aging / Near-Expiry' },
  { value: 'fillRate', label: 'Fill Rate / Service Level' },
  { value: 'oee', label: 'OEE' },
];

const SECTION_TITLES = {
  dio: 'EXCESS INVENTORY',
  aging: 'AGING INVENTORY',
  fillRate: 'SERVICE LEVEL GAP',
  oee: 'PRODUCTION EFFICIENCY',
};

const ACCURACY_LEVELS = [
  { value: '', label: 'Select level...' },
  { value: 'SKU-Week', label: 'SKU-Week' },
  { value: 'SKU-Month', label: 'SKU-Month' },
  { value: 'Product Family-Month', label: 'Product Family-Month' },
  { value: 'National-Month', label: 'National-Month' },
];

export default function ExcessInventorySection({ inputs, results, narratives, benchmarks, onInputChange }) {
  const focus = inputs.diagnosticFocus || 'dio';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
      {/* Section header with title + focus selector */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {SECTION_TITLES[focus] || 'EXCESS INVENTORY'}
        </h2>
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

      {/* Headline metrics — always visible */}
      {focus === 'dio' && <DIOHeadline inputs={inputs} results={results} onInputChange={onInputChange} />}
      {focus === 'aging' && <AgingHeadline inputs={inputs} results={results} onInputChange={onInputChange} />}
      {focus === 'fillRate' && <FillRateHeadline inputs={inputs} onInputChange={onInputChange} />}
      {focus === 'oee' && <OEEHeadline inputs={inputs} onInputChange={onInputChange} />}

      {/* Expandable: How is this calculated? */}
      <AnimatedExpandable
        title="How is this calculated?"
        badge={{ label: 'Effect', color: '#3B82F6' }}
      >
        {focus === 'dio' && (
          <div className="text-sm text-gray-600 space-y-2">
            <p>DIO = (Inventory ÷ COGS) × 365</p>
            {results.effectiveCOGS != null && inputs.inventory != null && (
              <p>= ({formatCr(inputs.inventory)} ÷ {formatCr(results.effectiveCOGS)}) × 365 = {results.effectiveDIO} days</p>
            )}
            {results.medianDIO != null && (
              <p>{inputs.industry || 'Industry'} median: {results.medianDIO} days (source: ReadyRatios, SEC filings)</p>
            )}
            {results.excessInventory != null && results.dioGap != null && (
              <>
                <p>Excess days: {results.effectiveDIO} − {results.medianDIO} = {results.dioGap} days</p>
                <p>Excess value: {results.dioGap} × ({formatCr(results.effectiveCOGS)} ÷ 365) = {formatCr(results.excessInventory)}</p>
              </>
            )}
          </div>
        )}
        {focus === 'aging' && (
          <div className="text-sm text-gray-600 space-y-2">
            {results.effectiveDIO != null && results.medianDIO != null && (
              <p>DIO = {results.effectiveDIO} days — pharma median is {results.medianDIO} days. {results.dioGap <= 5 ? 'DIO looks fine. But the aging profile tells a different story.' : ''}</p>
            )}
            {inputs.nearExpiryPct != null && inputs.inventory != null && (
              <p>Near-expiry = {inputs.nearExpiryPct}% of {formatCr(inputs.inventory)} = {formatCr(results.nearExpiryValue)}</p>
            )}
          </div>
        )}
        {narratives.effectNarrative && (
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            {narratives.effectNarrative}
          </p>
        )}
      </AnimatedExpandable>

      {/* Expandable: Why does this excess exist? */}
      <AnimatedExpandable
        title={focus === 'aging' ? 'Why is stock aging?' : 'Why does this excess exist?'}
        badge={{ label: 'Cause', color: '#F59E0B' }}
      >
        <CauseSection inputs={inputs} results={results} narratives={narratives} benchmarks={benchmarks} onInputChange={onInputChange} />
      </AnimatedExpandable>

      {/* Expandable: How is the company coping? */}
      <AnimatedExpandable
        title="How is the company coping?"
        badge={{ label: 'Compensation', color: '#D97706' }}
      >
        <CompensationSection inputs={inputs} results={results} narratives={narratives} onInputChange={onInputChange} />
      </AnimatedExpandable>
    </div>
  );
}

/* ——— Headline sub-components ——— */

function DIOHeadline({ inputs, results, onInputChange }) {
  const { effectiveDIO, medianDIO, bestDIO, dioGap, excessInventory } = results;

  return (
    <div className="space-y-3 mb-2">
      <div className="space-y-1">
        {inputs.inventory != null && effectiveDIO != null && (
          <p className="text-sm text-gray-700">
            Your inventory: <span className="font-semibold">{formatCr(inputs.inventory)}</span>
            <span className="text-gray-500"> ({effectiveDIO} days of stock)</span>
            <AssumedBadge isAssumed={results.assumed.dio} />
          </p>
        )}
        {medianDIO != null && (
          <p className="text-sm text-gray-500">
            Industry median: <span className="font-medium text-gray-700">{medianDIO} days</span>
          </p>
        )}
        {excessInventory != null && dioGap > 0 && (
          <p className="text-sm font-semibold text-red-600">
            Excess: {formatCr(excessInventory)}
          </p>
        )}
      </div>

      {effectiveDIO != null && medianDIO != null && bestDIO != null && (
        <DIORange dio={effectiveDIO} medianDIO={medianDIO} bestDIO={bestDIO} />
      )}

      {/* DIO input — small inline, since headline shows the computed value */}
      <div className="flex items-center gap-2">
        <label className="text-[10px] uppercase tracking-wider text-gray-400">DIO</label>
        <input
          type="number"
          value={inputs.dio ?? ''}
          onChange={(e) => onInputChange('dio', e.target.value === '' ? null : Number(e.target.value))}
          placeholder={effectiveDIO ?? 'e.g. 78'}
          className="input-field w-20 text-sm text-center"
        />
        <span className="text-xs text-gray-400">days (override auto-calc)</span>
      </div>
    </div>
  );
}

function AgingHeadline({ inputs, results, onInputChange }) {
  const { effectiveDIO, medianDIO, nearExpiryValue } = results;

  return (
    <div className="space-y-3 mb-2">
      {effectiveDIO != null && (
        <p className="text-sm text-gray-700">
          Total inventory: <span className="font-semibold">{formatCr(inputs.inventory)}</span>
          <span className="text-gray-500"> ({effectiveDIO} days{medianDIO != null ? ` — ${Math.abs(effectiveDIO - medianDIO) <= 5 ? 'at' : 'near'} median` : ''})</span>
        </p>
      )}

      <div className="flex items-center gap-2">
        <label className="text-[10px] uppercase tracking-wider text-gray-400">Near-expiry %</label>
        <input
          type="number"
          value={inputs.nearExpiryPct ?? ''}
          onChange={(e) => onInputChange('nearExpiryPct', e.target.value === '' ? null : Number(e.target.value))}
          placeholder="e.g. 18"
          className="input-field w-20 text-sm text-center"
        />
        <span className="text-xs text-gray-400">% of inventory</span>
      </div>

      {nearExpiryValue != null && inputs.nearExpiryPct != null && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
          <div className="text-sm font-semibold text-red-800 mb-1">
            Near-expiry ({'<'}6 months): {formatCr(nearExpiryValue)} ({inputs.nearExpiryPct}% of stock)
          </div>
        </div>
      )}
    </div>
  );
}

function FillRateHeadline({ inputs, onInputChange }) {
  const typical = 96;
  const fillRate = inputs.fillRate;
  const gap = fillRate != null ? typical - fillRate : null;

  return (
    <div className="space-y-2 mb-2">
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
    </div>
  );
}

function OEEHeadline({ inputs, onInputChange }) {
  return (
    <div className="space-y-3 mb-2">
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

      <div className="flex gap-4">
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
    </div>
  );
}

/* ——— Expandable content sub-components ——— */

function CauseSection({ inputs, results, narratives, benchmarks, onInputChange }) {
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

      {typical != null && best != null && accuracy != null && (
        <AccuracyRange accuracy={accuracy} typical={typical} best={best} />
      )}

      {narratives.causeNarrative && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {narratives.causeNarrative}
        </p>
      )}

      <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100">
        <p>MAPE (Mean Absolute Percentage Error) measures forecast accuracy at the specified granularity.</p>
        {typical != null && <p>Industry typical: {typical}% — Best-in-class: {best}%</p>}
        <p>Lower is better. A 10-point improvement typically reduces safety stock by 15-20%.</p>
      </div>
    </div>
  );
}

function CompensationSection({ inputs, results, narratives, onInputChange }) {
  return (
    <div className="space-y-3">
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

      {narratives.contradiction && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-800 flex gap-2">
            <span className="shrink-0">&#9888;&#65039;</span>
            {narratives.contradiction}
          </div>
        </div>
      )}

      {narratives.compensationInsight && (
        <p className="text-sm font-medium text-gray-700 italic">
          {narratives.compensationInsight}
        </p>
      )}

      <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100">
        <p>Compensation mechanisms mask the root cause. High fill rate + low forecast accuracy = expensive safety stock.</p>
        <p>Each 1% of fill rate above 95% costs exponentially more in inventory investment.</p>
      </div>
    </div>
  );
}
