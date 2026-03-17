import { formatCr } from '../utils/formatCurrency';

/**
 * Pure calculation engine. Takes inputs + industry benchmarks, returns all derived values.
 * Every number field in inputs is null when empty — benchmarks fill the gap.
 */
export function calculateAll(inputs, benchmarks) {
  if (!benchmarks) {
    return emptyResults();
  }

  const revenue = num(inputs.revenue);
  const grossMargin = benchmarks.grossMargin.value;

  // --- Effective COGS (auto-estimate if empty) ---
  const rawCogs = num(inputs.cogs);
  const effectiveCOGS = rawCogs ?? (revenue != null ? Math.round(revenue * (1 - grossMargin)) : null);
  const cogsAssumed = rawCogs == null && effectiveCOGS != null;

  // --- Effective Inventory ---
  const inventory = num(inputs.inventory);

  // --- Diagnostic focus ---
  const focus = inputs.diagnosticFocus || 'dio';

  // --- DIO focus calculations ---
  const medianDIO = benchmarks.medianDIO.value;
  const bestDIO = benchmarks.bestInClassDIO.value;

  // Auto-calculate DIO from inventory + COGS
  const rawDIO = num(inputs.dio);
  let effectiveDIO = rawDIO;
  if (effectiveDIO == null && inventory != null && effectiveCOGS != null && effectiveCOGS > 0) {
    effectiveDIO = Math.round((inventory / effectiveCOGS) * 365);
  }
  const dioAssumed = rawDIO == null && effectiveDIO != null;

  const dioGap = effectiveDIO != null ? Math.max(0, effectiveDIO - medianDIO) : null;
  const dailyCOGS = effectiveCOGS != null ? effectiveCOGS / 365 : null;
  const excessInventory = dioGap != null && dailyCOGS != null ? Math.round(dioGap * dailyCOGS) : null;

  // --- Aging focus calculations ---
  const nearExpiryPct = num(inputs.nearExpiryPct);
  const nearExpiryValue = nearExpiryPct != null && inventory != null
    ? Math.round(inventory * nearExpiryPct / 100)
    : null;

  // --- Fill rate ---
  const fillRate = num(inputs.fillRate) ?? benchmarks.typicalFillRate.value;
  const fillRateAssumed = num(inputs.fillRate) == null;

  // --- Forecast accuracy ---
  const forecastAccuracy = num(inputs.forecastAccuracy) ?? benchmarks.typicalMAPE.value;
  const accuracyAssumed = num(inputs.forecastAccuracy) == null;

  // --- Cost calculations ---
  let costs;
  if (focus === 'aging') {
    costs = calculateAgingCosts(inputs, inventory, nearExpiryValue, benchmarks);
  } else {
    costs = calculateDIOCosts(inputs, excessInventory, inventory, effectiveCOGS, benchmarks);
  }

  const totalCost = costs.reduce((sum, c) => sum + (c.amount ?? 0), 0);
  const costAsPctRevenue = revenue != null && revenue > 0
    ? Math.round((totalCost / revenue) * 1000) / 10
    : null;

  // --- ROI ---
  const gapClosurePct = num(inputs.gapClosurePct) ?? 30;
  const baseForCapitalFreed = focus === 'aging' ? nearExpiryValue : excessInventory;
  const annualSavings = totalCost > 0 ? Math.round(totalCost * gapClosurePct / 100) : null;
  const capitalFreed = baseForCapitalFreed != null ? Math.round(baseForCapitalFreed * gapClosurePct / 100) : null;

  return {
    effectiveCOGS,
    effectiveDIO,
    medianDIO,
    bestDIO,
    dioGap,
    excessInventory,
    nearExpiryValue,
    fillRate,
    forecastAccuracy,
    costs,
    totalCost,
    costAsPctRevenue,
    annualSavings,
    capitalFreed,
    gapClosurePct,
    assumed: {
      cogs: cogsAssumed,
      dio: dioAssumed,
      fillRate: fillRateAssumed,
      forecastAccuracy: accuracyAssumed,
    },
    hasEnoughData: revenue != null,
  };
}

function calculateDIOCosts(inputs, excessInventory, inventory, effectiveCOGS, benchmarks) {
  const carryingRate = benchmarks.carryingCostRate.value;
  const writeOffRate = benchmarks.writeOffRate.value;
  const freightPct = benchmarks.freightPctOfCOGS.value;
  const expeditedPct = benchmarks.expeditedPctOfFreight.value;

  const calcCarrying = excessInventory != null ? Math.round(excessInventory * carryingRate) : null;
  const calcWriteOff = inventory != null ? Math.round(inventory * writeOffRate) : null;
  const calcFreight = effectiveCOGS != null ? Math.round(effectiveCOGS * freightPct * expeditedPct) : null;

  const overrideCarrying = num(inputs.overrideCarryingCost);
  const overrideWriteOff = num(inputs.overrideWriteOff);
  const overrideFreight = num(inputs.overrideFreight);

  return [
    {
      name: 'Excess Carrying Cost',
      amount: overrideCarrying ?? calcCarrying,
      formula: excessInventory != null
        ? `${formatCr(excessInventory)} × ${pct(carryingRate)} carrying cost rate`
        : 'Needs DIO gap to calculate',
      conviction: overrideCarrying != null ? 'Override' : 'Calculated',
      isOverride: overrideCarrying != null,
      calculated: calcCarrying,
    },
    {
      name: 'Write-off Risk',
      amount: overrideWriteOff ?? calcWriteOff,
      formula: inventory != null
        ? `${formatCr(inventory)} × ${pct(writeOffRate)} industry write-off rate`
        : 'Needs inventory to calculate',
      conviction: overrideWriteOff != null ? 'Override' : 'Solid',
      isOverride: overrideWriteOff != null,
      calculated: calcWriteOff,
    },
    {
      name: 'Freight Premium',
      amount: overrideFreight ?? calcFreight,
      formula: effectiveCOGS != null
        ? `${formatCr(effectiveCOGS)} × ${pct(freightPct)} freight × ${pct(expeditedPct)} expedited`
        : 'Needs COGS to calculate',
      conviction: overrideFreight != null ? 'Override' : 'Estimated',
      isOverride: overrideFreight != null,
      calculated: calcFreight,
    },
  ];
}

function calculateAgingCosts(inputs, inventory, nearExpiryValue, benchmarks) {
  const carryingRate = benchmarks.carryingCostRate.value;
  const destructionRate = 0.30; // 30% of near-expiry destroyed
  const discountRate = 0.30;    // 30% of near-expiry sold at deep discount

  const calcDestroyed = nearExpiryValue != null ? Math.round(nearExpiryValue * destructionRate) : null;
  const calcDiscount = nearExpiryValue != null ? Math.round(nearExpiryValue * discountRate * 0.5) : null; // 50% margin loss
  const calcCarrying = nearExpiryValue != null ? Math.round(nearExpiryValue * carryingRate) : null;

  const overrideCarrying = num(inputs.overrideCarryingCost);
  const overrideWriteOff = num(inputs.overrideWriteOff);
  const overrideFreight = num(inputs.overrideFreight);

  return [
    {
      name: 'Destroyed Stock',
      amount: overrideWriteOff ?? calcDestroyed,
      formula: nearExpiryValue != null
        ? `~30% of ${formatCr(nearExpiryValue)} near-expiry destroyed`
        : 'Needs near-expiry % to calculate',
      conviction: overrideWriteOff != null ? 'Override' : 'Estimated',
      isOverride: overrideWriteOff != null,
      calculated: calcDestroyed,
    },
    {
      name: 'Margin Destruction (Discounts)',
      amount: overrideFreight ?? calcDiscount,
      formula: nearExpiryValue != null
        ? `~30% of near-expiry sold at deep discount`
        : 'Needs near-expiry % to calculate',
      conviction: overrideFreight != null ? 'Override' : 'Estimated',
      isOverride: overrideFreight != null,
      calculated: calcDiscount,
    },
    {
      name: 'Carrying Cost on Near-Expiry',
      amount: overrideCarrying ?? calcCarrying,
      formula: nearExpiryValue != null
        ? `${formatCr(nearExpiryValue)} × ${pct(carryingRate)} carrying cost rate`
        : 'Needs near-expiry value to calculate',
      conviction: overrideCarrying != null ? 'Override' : 'Calculated',
      isOverride: overrideCarrying != null,
      calculated: calcCarrying,
    },
  ];
}

function emptyResults() {
  return {
    effectiveCOGS: null, effectiveDIO: null, medianDIO: null, bestDIO: null,
    dioGap: null, excessInventory: null, nearExpiryValue: null,
    fillRate: null, forecastAccuracy: null,
    costs: [], totalCost: 0, costAsPctRevenue: null,
    annualSavings: null, capitalFreed: null, gapClosurePct: 30,
    assumed: { cogs: false, dio: false, fillRate: false, forecastAccuracy: false },
    hasEnoughData: false,
  };
}

/** Parse to number or return null */
function num(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

/** Format a decimal as percentage string */
function pct(v) {
  if (v < 1) return `${(v * 100).toFixed(1).replace(/\.0$/, '')}%`;
  return `${v}%`;
}
