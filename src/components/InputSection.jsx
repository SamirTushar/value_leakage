import { useState } from 'react';
import { ACCURACY_LEVELS, adjustAccuracy } from '../logic/adjustments';
import { formatCr } from '../utils/formatCurrency';
import BenchmarkBar from './BenchmarkBar';

export default function InputSection({ inputs, benchmarks, onUpdate }) {
  const [showDIOOverride, setShowDIOOverride] = useState(false);
  const b = benchmarks;
  const hasRevenue = inputs.revenue != null && inputs.revenue !== '';
  const isListed = inputs.companyType === 'Listed';

  const adjustedMAPE = inputs.reportedAccuracy != null && inputs.reportedAccuracy !== ''
    ? adjustAccuracy(Number(inputs.reportedAccuracy), inputs.accuracyLevel)
    : null;

  // Auto-calculate COGS for unlisted
  const autoCOGS = !isListed && hasRevenue && b
    ? Number((inputs.revenue * (1 - b.grossMargin.value)).toFixed(1))
    : null;

  // Effective COGS for DIO auto-calc
  const effectiveCOGS = inputs.cogs ?? autoCOGS;

  // Auto-calculated DIO from inventory
  const autoDIO = inputs.inventoryValue && effectiveCOGS
    ? Math.round((inputs.inventoryValue / effectiveCOGS) * 365)
    : null;

  const displayDIO = inputs.dio ?? autoDIO;

  const disabled = !hasRevenue || !b;

  return (
    <div className={`space-y-5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Financials Group */}
      <Section title="Financials">
        {isListed ? (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <CompactField
                label="COGS (₹ Cr)"
                helper="Cost of Goods Sold — from the P&L. Needed to calculate daily inventory cost."
              >
                <input
                  type="number"
                  value={inputs.cogs ?? ''}
                  onChange={(e) => onUpdate({ cogs: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g. 5956"
                  className="input-field w-full"
                />
              </CompactField>

              <CompactField
                label="Inventory (₹ Cr)"
                helper="Total inventory on balance sheet. We'll calculate DIO from this."
              >
                <input
                  type="number"
                  value={inputs.inventoryValue ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    const cogs = inputs.cogs;
                    const updates = { inventoryValue: val };
                    if (val != null && cogs) {
                      updates.dio = Math.round((val / cogs) * 365);
                    } else if (val == null) {
                      if (autoDIO != null) updates.dio = null;
                    }
                    onUpdate(updates);
                  }}
                  placeholder="e.g. 1271"
                  className="input-field w-full"
                />
              </CompactField>
            </div>

            {/* DIO Display Block */}
            <div className="mt-3 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Days Inventory Outstanding (DIO)</label>
                {displayDIO != null && !showDIOOverride && (
                  <button
                    onClick={() => setShowDIOOverride(true)}
                    className="text-[10px] text-teal-600 hover:underline cursor-pointer"
                  >
                    Override
                  </button>
                )}
                {showDIOOverride && (
                  <button
                    onClick={() => { setShowDIOOverride(false); onUpdate({ dio: null }); }}
                    className="text-[10px] text-teal-600 hover:underline cursor-pointer"
                  >
                    Use calculated
                  </button>
                )}
              </div>
              {showDIOOverride ? (
                <input
                  type="number"
                  value={inputs.dio ?? ''}
                  onChange={(e) => onUpdate({ dio: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Enter DIO manually"
                  className="input-field w-32"
                />
              ) : displayDIO != null ? (
                <p className="text-2xl font-bold text-gray-900">{displayDIO} <span className="text-sm font-normal text-gray-400">days</span></p>
              ) : (
                <p className="text-sm text-gray-400">Enter COGS and inventory above to auto-calculate</p>
              )}
              {b && displayDIO != null && (
                <>
                  <InlineBenchmark
                    value={displayDIO}
                    benchmarkLabel={inputs.industryLabel}
                    median={b.medianDIO.value}
                    best={b.bestInClassDIO.value}
                    unit=" days"
                    lowerIsBetter
                  />
                  <BenchmarkBar
                    value={displayDIO}
                    best={b.bestInClassDIO.value}
                    typical={b.medianDIO.value}
                    worst={Math.max(displayDIO * 1.3, b.medianDIO.value * 2)}
                    unit=""
                    lowerIsBetter
                  />
                </>
              )}
              {b && displayDIO == null && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {inputs.industryLabel} median: {b.medianDIO.value} days · Best: {b.bestInClassDIO.value} days
                </p>
              )}
            </div>
          </div>
        ) : b && autoCOGS != null ? (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              We estimate COGS at {formatCr(autoCOGS)} based on {inputs.industryLabel} gross margin of {(b.grossMargin.value * 100).toFixed(0)}%.
              <button
                onClick={() => {
                  const val = prompt('Enter COGS (₹ Cr):', autoCOGS);
                  if (val) onUpdate({ cogs: Number(val) });
                }}
                className="ml-1 text-teal-600 hover:underline cursor-pointer"
              >
                Edit if known
              </button>
            </p>
          </div>
        ) : null}
      </Section>

      {/* Supply Chain Metrics Group */}
      <Section title="Supply Chain Metrics">
        <div className="space-y-3">
          {/* Forecast Accuracy */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <CompactField
                  label="Forecast Accuracy (MAPE %)"
                  helper="How far off demand forecasts are from actuals. Lower = better."
                  className="flex-1"
                >
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inputs.reportedAccuracy ?? ''}
                    onChange={(e) => onUpdate({ reportedAccuracy: e.target.value ? Number(e.target.value) : null })}
                    placeholder={b ? `e.g. 45 (industry typical: ${b.typicalMAPE.value}%)` : 'e.g. 45'}
                    className="input-field w-full"
                  />
                </CompactField>
                {inputs.reportedAccuracy != null && inputs.reportedAccuracy !== '' && (
                  <CompactField
                    label="Level"
                    helper="Level at which accuracy is measured. Aggregate numbers hide reality."
                  >
                    <select
                      value={inputs.accuracyLevel}
                      onChange={(e) => onUpdate({ accuracyLevel: e.target.value })}
                      className="input-field cursor-pointer text-xs"
                    >
                      {ACCURACY_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </CompactField>
                )}
              </div>
              {b && (
                <div className="mt-1">
                  {inputs.reportedAccuracy != null && inputs.reportedAccuracy !== '' ? (
                    <>
                      <InlineBenchmark
                        value={adjustedMAPE ?? inputs.reportedAccuracy}
                        benchmarkLabel={inputs.industryLabel}
                        median={b.typicalMAPE.value}
                        best={b.bestInClassMAPE.value}
                        unit="%"
                        lowerIsBetter
                      />
                      <BenchmarkBar
                        value={adjustedMAPE ?? inputs.reportedAccuracy}
                        best={b.bestInClassMAPE.value}
                        typical={b.typicalMAPE.value}
                        worst={100}
                        unit="%"
                        lowerIsBetter
                      />
                      {inputs.accuracyLevel !== 'SKU-Week' && adjustedMAPE != null && (
                        <p className="text-[10px] text-amber-600 mt-0.5">
                          At SKU-week level: ~{adjustedMAPE.toFixed(0)}%{adjustedMAPE >= 100 ? ' — effectively no better than guessing' : ''}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {inputs.industryLabel} typical: {b.typicalMAPE.value}% · Best-in-class: {b.bestInClassMAPE.value}%
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DIO for unlisted (since listed gets it above in Financials) */}
          {!isListed && (
            <CompactField
              label="Days Inventory Outstanding (DIO)"
              helper="Days your inventory could cover sales. Higher = more cash locked."
            >
              <input
                type="number"
                value={inputs.dio ?? ''}
                onChange={(e) => onUpdate({ dio: e.target.value ? Number(e.target.value) : null })}
                placeholder={b ? `e.g. 78 (industry median: ${b.medianDIO.value})` : 'e.g. 78'}
                className="input-field w-48"
              />
              {b && inputs.dio != null && inputs.dio !== '' && (
                <>
                  <InlineBenchmark
                    value={inputs.dio}
                    benchmarkLabel={inputs.industryLabel}
                    median={b.medianDIO.value}
                    best={b.bestInClassDIO.value}
                    unit=" days"
                    lowerIsBetter
                  />
                  <BenchmarkBar
                    value={inputs.dio}
                    best={b.bestInClassDIO.value}
                    typical={b.medianDIO.value}
                    worst={Math.max(inputs.dio * 1.3, b.medianDIO.value * 2)}
                    unit=""
                    lowerIsBetter
                  />
                </>
              )}
            </CompactField>
          )}

          {/* Fill Rate */}
          <CompactField
            label="Fill Rate / Service Level (%)"
            helper="% of orders fulfilled on time and in full"
          >
            <input
              type="number"
              min="0"
              max="100"
              value={inputs.fillRate ?? ''}
              onChange={(e) => onUpdate({ fillRate: e.target.value ? Number(e.target.value) : null })}
              placeholder={b ? `e.g. 96 (industry typical: ${b.typicalFillRate.value}%)` : 'e.g. 96'}
              className="input-field w-48"
            />
            {b && inputs.fillRate != null && inputs.fillRate !== '' && (
              <>
                <InlineBenchmark
                  value={inputs.fillRate}
                  benchmarkLabel={inputs.industryLabel}
                  median={b.typicalFillRate.value}
                  best={99}
                  unit="%"
                  lowerIsBetter={false}
                />
                <BenchmarkBar
                  value={inputs.fillRate}
                  best={99}
                  typical={b.typicalFillRate.value}
                  worst={85}
                  unit="%"
                  lowerIsBetter={false}
                />
              </>
            )}
          </CompactField>

          {/* Expedited Freight */}
          <CompactField
            label="Expedited Freight (₹ Cr/year)"
            helper="Annual spend on rush / premium shipments to fix planning gaps"
            optional
          >
            <input
              type="number"
              value={inputs.expeditedFreight ?? ''}
              onChange={(e) => onUpdate({ expeditedFreight: e.target.value ? Number(e.target.value) : null })}
              placeholder="e.g. 40"
              className="input-field w-48"
            />
          </CompactField>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function CompactField({ label, helper, optional, className, children }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
        {label}
        {optional && <span className="text-[10px] text-gray-400 font-normal">(optional)</span>}
      </label>
      <div className="mt-1">{children}</div>
      {helper && <p className="text-[10px] text-gray-400 mt-0.5">{helper}</p>}
    </div>
  );
}

function InlineBenchmark({ value, benchmarkLabel, median, best, unit, lowerIsBetter }) {
  const gap = lowerIsBetter ? value - best : best - value;
  const vsMedian = lowerIsBetter ? value - median : median - value;

  let comparison;
  if (lowerIsBetter) {
    if (value <= best) comparison = <span className="text-emerald-600">at or better than best-in-class</span>;
    else if (value <= median) comparison = <span className="text-emerald-600">{Math.abs(vsMedian).toFixed(0)}{unit} better than typical</span>;
    else comparison = <span className="text-amber-600">{gap.toFixed(0)}{unit} below best · {Math.abs(vsMedian).toFixed(0)}{unit} above typical</span>;
  } else {
    if (value >= best) comparison = <span className="text-emerald-600">at or better than best-in-class</span>;
    else if (value >= median) comparison = <span className="text-emerald-600">{Math.abs(vsMedian).toFixed(0)}{unit} better than typical</span>;
    else comparison = <span className="text-amber-600">{Math.abs(gap).toFixed(0)}{unit} below best · {Math.abs(vsMedian).toFixed(0)}{unit} below typical</span>;
  }

  return (
    <p className="text-[10px] text-gray-500 mt-0.5">
      {benchmarkLabel} typical: {median}{unit} · Best: {best}{unit} · You: {comparison}
    </p>
  );
}
