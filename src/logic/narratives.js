import { formatCr } from '../utils/formatCurrency';

/**
 * Generate all narrative text from inputs + computed results + benchmarks.
 * Pure function — no side effects.
 */
export function generateNarratives(inputs, results, benchmarks) {
  if (!benchmarks || !results.hasEnoughData) {
    return {
      effectNarrative: '',
      causeNarrative: '',
      compensationItems: [],
      compensationInsight: '',
      contradiction: null,
    };
  }

  const focus = inputs.diagnosticFocus || 'dio';

  return {
    effectNarrative: generateEffectNarrative(inputs, results, focus),
    causeNarrative: generateCauseNarrative(inputs, results, benchmarks),
    compensationItems: generateCompensationItems(inputs, results, focus),
    compensationInsight: generateCompensationInsight(focus),
    contradiction: detectContradiction(inputs, results),
  };
}

function generateEffectNarrative(inputs, results, focus) {
  const name = inputs.companyName || 'This company';

  if (focus === 'aging') {
    const { nearExpiryValue } = results;
    const pct = inputs.nearExpiryPct;
    if (pct == null || nearExpiryValue == null) {
      return 'Enter near-expiry percentage to see the aging diagnostic.';
    }
    return `DIO is ${results.effectiveDIO ?? '?'} days — right at the pharma median of ${results.medianDIO} days. Looks fine. But ${pct}% of inventory (${formatCr(nearExpiryValue)}) is within 6 months of expiry. DIO alone misses this entirely.`;
  }

  if (focus === 'fillRate') {
    const fr = results.fillRate;
    const typical = benchmarks?.typicalFillRate?.value ?? 96;
    if (fr == null) return 'Enter fill rate to see the service level diagnostic.';
    const gap = typical - fr;
    if (gap <= 0) return `Fill rate at ${fr}% is at or above the industry typical of ${typical}%. Service level is healthy.`;
    return `Fill rate at ${fr}% is ${gap} points below the industry typical of ${typical}%. Each point of fill rate gap represents lost sales and customer dissatisfaction.`;
  }

  if (focus === 'oee') {
    const oee = inputs.oee;
    if (oee == null) return 'Enter OEE to see the production efficiency diagnostic.';
    return `OEE at ${oee}% — ${oee < 65 ? 'significantly below' : oee < 85 ? 'below' : 'at'} world-class benchmark of 85%. ${oee < 85 ? 'Performance component is typically the weak link.' : 'Strong production efficiency.'}`;
  }

  // DIO focus (default)
  const { effectiveDIO, medianDIO, dioGap, excessInventory } = results;
  if (effectiveDIO == null) {
    return 'Enter inventory and COGS (or DIO directly) to see the inventory diagnostic.';
  }
  if (dioGap <= 0) {
    return `${name} carries ${effectiveDIO} days of inventory, at or below the industry median of ${medianDIO} days. Inventory levels are healthy.`;
  }
  return `${name} carries ${effectiveDIO} days of inventory. Industry median is ${medianDIO} days. That's ${dioGap} extra days — ${formatCr(excessInventory)} sitting in excess stock.`;
}

function generateCauseNarrative(inputs, results, benchmarks) {
  const accuracy = results.forecastAccuracy;
  const typical = benchmarks.typicalMAPE.value;
  const best = benchmarks.bestInClassMAPE.value;
  const isAssumed = results.assumed.forecastAccuracy;

  if (isAssumed) {
    return `Forecast accuracy not known. Using industry typical of ${typical}%. Even at typical levels, downstream compensation costs are significant.`;
  }

  if (accuracy < 40) {
    return `Forecast accuracy at ${accuracy}% means the demand signal is wrong more often than it's right. Downstream costs will be severe.`;
  }
  if (accuracy <= 50) {
    return `Forecast accuracy at ~${accuracy}% means the demand signal is wrong roughly half the time. Everything downstream compensates for this.`;
  }
  if (accuracy <= 65) {
    const gap = accuracy - best;
    return `Forecast accuracy at ${accuracy}% is moderate. There's a ${gap}-point gap to best-in-class (${best}%). Compensation costs are real but moderate.`;
  }
  const gap = accuracy - best;
  return `Forecast accuracy at ${accuracy}% is strong. Gap to best-in-class is ${gap} points. Leakage is in fine-tuning, not structural gaps.`;
}

function generateCompensationItems(inputs, results, focus) {
  const excessStr = results.excessInventory != null ? formatCr(results.excessInventory) : '?';
  const fillStr = results.fillRate != null ? `${results.fillRate}%` : '?';

  if (focus === 'aging') {
    return [
      'Near-expiry stock dumped to hospitals at deep discounts (40-60% off)',
      'Free goods schemes to push stock through distributors before expiry',
      'Quarterly destruction of expired stock with regulatory disposal costs',
    ];
  }

  if (focus === 'fillRate') {
    return [
      'Safety stock buffers to maintain service levels despite forecast noise',
      'Expedited shipments to cover stock-outs at key distribution points',
      'Manual order intervention to reallocate stock between locations',
    ];
  }

  if (focus === 'oee') {
    return [
      'Raw material buffer because production plan keeps changing',
      'Overtime and weekend shifts to catch up after schedule disruptions',
      'Suppliers penalized with frequent PO changes and emergency orders',
    ];
  }

  // DIO focus
  return [
    'Safety stock set at ~2× what\'s mathematically needed to buffer forecast uncertainty',
    `Fill rate is ${fillStr} — looks healthy, but it's being bought with ${excessStr} in excess inventory`,
    'Expedited freight fills the gaps that even excess stock can\'t cover',
  ];
}

function generateCompensationInsight(focus) {
  if (focus === 'aging') {
    return 'The traditional DIO metric says everything is fine. The aging profile tells a completely different story.';
  }
  if (focus === 'oee') {
    return 'The factory runs in firefighting mode. Every compensation adds cost and erodes supplier relationships.';
  }
  return 'None of these fix the root cause. They manage the symptom at a cost.';
}

function detectContradiction(inputs, results) {
  const fillRate = results.fillRate;
  const accuracy = results.forecastAccuracy;
  const excess = results.excessInventory;

  if (fillRate != null && fillRate >= 96 && accuracy != null && accuracy < 50) {
    return `Fill rate is ${fillRate}% despite forecast accuracy of ${accuracy}%. This gap is bridged by excess inventory${excess != null ? ` (${formatCr(excess)})` : ''} and premium freight.`;
  }

  return null;
}
