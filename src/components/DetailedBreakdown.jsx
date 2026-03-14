import GapCard from './GapCard';
import LeakageChart from './LeakageChart';
import SourceFooter from './SourceFooter';
import { formatCr, formatPct } from '../utils/formatCurrency';

export default function DetailedBreakdown({ inputs, benchmarks, gaps, contradictions, onBack }) {
  const b = benchmarks;
  const industryLabel = inputs.industryLabel || 'Industry';

  // Build gap card data (ordered by conviction: Gap3, Gap4, Gap2, Gap1)
  const gapCards = [];

  // Gap 3: Excess Capital Trapped
  if (gaps.gap3) {
    let driver;
    const rule1or2 = contradictions.some(c => c.id === 1 || c.id === 2);
    const rule3 = contradictions.some(c => c.id === 3);
    if (rule1or2) {
      driver = `DIO ${gaps.gap3.excessDays} days above median. With accuracy at ${inputs.adjustedAccuracy?.toFixed(0) ?? '—'}%, excess is safety stock compensating for forecast.`;
    } else if (rule3) {
      driver = `DIO ${gaps.gap3.excessDays} days above median but fill rate only ${inputs.fillRate}%. Excess is in the wrong products.`;
    } else {
      driver = `DIO of ${inputs.dio} days vs industry median of ${b.medianDIO.value} days.`;
    }

    gapCards.push({
      name: 'Excess Capital Trapped',
      amount: gaps.gap3.value,
      conviction: 'calculated',
      description: 'Cash locked in inventory above what\'s needed to maintain service levels.',
      formula: `(Your DIO ${inputs.dio} − Benchmark ${b.medianDIO.value}) × ${formatCr(gaps.gap3.dailyCOGS)} daily COGS × ${(gaps.gap3.carryingCostRate * 100).toFixed(0)}% carrying cost`,
      driver,
      value: gaps.gap3.value,
    });
  }

  // Gap 4: Value Destroyed
  if (gaps.gap4) {
    const driver = inputs.dio > b.medianDIO.value + 20
      ? 'Higher inventory increases aging and write-off exposure.'
      : `Based on ${industryLabel.toLowerCase()} scrap/write-off rate of ${(gaps.gap4.writeOffRate * 100).toFixed(1)}%.`;

    gapCards.push({
      name: 'Value Destroyed',
      amount: gaps.gap4.value,
      conviction: 'solid',
      description: 'Stock at risk of expiry, obsolescence, or write-down annually.',
      formula: `Inventory ${formatCr(gaps.gap4.inventoryValue)} × ${(gaps.gap4.writeOffRate * 100).toFixed(1)}% write-off rate`,
      driver,
      value: gaps.gap4.value,
    });
  }

  // Gap 2: Cost Incurred
  if (gaps.gap2) {
    const rule1 = contradictions.some(c => c.id === 1);
    let driver;
    if (rule1) {
      driver = `Fill rate ${inputs.fillRate}% on ${inputs.adjustedAccuracy?.toFixed(0) ?? '—'}% accuracy — freight is bridging the gap.`;
    } else if (gaps.gap2.isDirectInput) {
      driver = 'Based on your reported expedited freight spend.';
    } else {
      driver = `Estimated from ${industryLabel.toLowerCase()} freight benchmarks. Enter actual spend to sharpen.`;
    }

    gapCards.push({
      name: 'Cost Unnecessarily Incurred',
      amount: gaps.gap2.value,
      conviction: gaps.gap2.isDirectInput ? 'calculated' : 'estimated',
      description: 'Premium freight and rush costs spent compensating for planning gaps.',
      formula: gaps.gap2.isDirectInput
        ? 'Direct input: expedited freight spend'
        : `COGS ${formatCr(inputs.cogs)} × ${(gaps.gap2.freightPct * 100).toFixed(0)}% freight × ${(gaps.gap2.expeditedPct * 100).toFixed(0)}% expedited`,
      driver,
      value: gaps.gap2.value,
    });
  }

  // Gap 1: Revenue Not Captured
  if (gaps.gap1) {
    let driver;
    if (inputs.fillRate != null && inputs.fillRate !== '' && inputs.fillRate < 94) {
      driver = `Fill rate at ${inputs.fillRate}% — below typical. Lost sales are likely material.`;
    } else if (inputs.fillRate != null && inputs.fillRate !== '' && inputs.fillRate > 96) {
      driver = `Service level is high at ${inputs.fillRate}%. Estimate is conservative, based on industry residual stockout patterns.`;
    } else {
      driver = `Based on ${industryLabel.toLowerCase()} average lost sales rate of ${(gaps.gap1.lostSalesRate * 100).toFixed(1)}%.`;
    }

    gapCards.push({
      name: 'Revenue Not Captured',
      amount: gaps.gap1.value,
      conviction: 'estimated',
      description: 'Estimated margin lost from stockouts and poor product availability.',
      formula: `Revenue ${formatCr(inputs.revenue)} × ${(gaps.gap1.lostSalesRate * 100).toFixed(1)}% lost sales × ${(gaps.gap1.grossMargin * 100).toFixed(0)}% gross margin`,
      driver,
      value: gaps.gap1.value,
    });
  }

  const total = gapCards.reduce((s, g) => s + (g.value || 0), 0);
  const totalPct = inputs.revenue ? (total / inputs.revenue) * 100 : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer transition-colors"
      >
        ← Back to Diagnostic
      </button>

      {/* Insight Banner */}
      {contradictions.length > 0 && contradictions[0].type !== 'metrics_ok' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <p className="text-sm text-amber-800 font-medium">⚠ {contradictions[0].text}</p>
          {contradictions.length > 1 && (
            <div className="mt-2 space-y-1">
              {contradictions.slice(1).map((c) => (
                <p key={c.id} className="text-xs text-amber-600">{c.text}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gap Cards */}
      <div className="space-y-4 mb-6">
        {gapCards.map((g) => (
          <GapCard key={g.name} {...g} />
        ))}
      </div>

      {/* Chart */}
      <LeakageChart gaps={gapCards} />

      {/* Total */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center mt-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
          Total Value Leakage
        </p>
        <p className="text-3xl font-bold text-gray-900">
          {formatCr(total)}<span className="text-lg font-normal text-gray-400">/year</span>
        </p>
        {totalPct != null && (
          <p className="text-sm text-gray-500 mt-1">{formatPct(totalPct)} of revenue</p>
        )}
      </div>

      <SourceFooter />
    </div>
  );
}
