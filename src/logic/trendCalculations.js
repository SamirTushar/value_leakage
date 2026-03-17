import { formatCr } from '../utils/formatCurrency';

/**
 * Multi-year trend calculation engine.
 * Takes array of { year, revenue, cogs, inventory } + industry benchmarks.
 * Returns enriched years data + trend metrics.
 */
export function calculateTrends(yearsData, benchmarks) {
  if (!yearsData || yearsData.length === 0) {
    return emptyTrends();
  }

  const medianDIO = benchmarks?.medianDIO?.value ?? null;
  const carryingRate = benchmarks?.carryingCostRate?.value ?? null;
  const writeOffRate = benchmarks?.writeOffRate?.value ?? null;
  const freightPct = benchmarks?.freightPctOfCOGS?.value ?? null;
  const expeditedPct = benchmarks?.expeditedPctOfFreight?.value ?? null;
  const grossMargin = benchmarks?.grossMargin?.value ?? null;

  // Enrich each year
  const years = yearsData.map((y) => {
    const revenue = y.revenue;
    const cogs = y.cogs ?? (revenue != null && grossMargin != null ? Math.round(revenue * (1 - grossMargin)) : null);
    const inventory = y.inventory;

    const dio = cogs != null && inventory != null && cogs > 0
      ? Math.round((inventory / cogs) * 365)
      : null;
    const dioGap = dio != null && medianDIO != null ? Math.max(0, dio - medianDIO) : null;
    const dailyCOGS = cogs != null ? cogs / 365 : null;
    const excessInventory = dioGap != null && dailyCOGS != null
      ? Math.round(dioGap * dailyCOGS)
      : null;

    const carryingCost = excessInventory != null && carryingRate != null ? Math.round(excessInventory * carryingRate) : null;
    const writeOffCost = inventory != null && writeOffRate != null ? Math.round(inventory * writeOffRate) : null;
    const freightCost = cogs != null && freightPct != null && expeditedPct != null ? Math.round(cogs * freightPct * expeditedPct) : null;
    const totalCost = sum(carryingCost, writeOffCost, freightCost);
    const grossPct = revenue != null && cogs != null && revenue > 0
      ? Math.round(((revenue - cogs) / revenue) * 100)
      : null;

    return {
      year: y.year,
      revenue,
      cogs,
      inventory,
      dio,
      medianDIO,
      dioGap,
      excessInventory,
      dailyCOGS,
      carryingCost,
      writeOffCost,
      freightCost,
      totalCost,
      grossPct,
    };
  });

  // Trend metrics
  const dios = years.map((y) => y.dio).filter((d) => d != null);
  const revenues = years.filter((y) => y.revenue != null).map((y) => y.revenue);
  const inventories = years.filter((y) => y.inventory != null).map((y) => y.inventory);
  const excesses = years.map((y) => y.excessInventory).filter((e) => e != null);

  const dioSlope = dios.length >= 2 ? linearSlope(dios) : 0;
  const dioTrend = dioSlope > 2 ? 'rising' : dioSlope < -2 ? 'falling' : 'stable';

  const revenueCAGR = revenues.length >= 2 ? cagr(revenues[0], revenues[revenues.length - 1], revenues.length - 1) : null;
  const inventoryCAGR = inventories.length >= 2 ? cagr(inventories[0], inventories[inventories.length - 1], inventories.length - 1) : null;

  const latestExcess = excesses.length > 0 ? excesses[excesses.length - 1] : null;
  const projectedExcess = excesses.length >= 2
    ? Math.round(excesses[excesses.length - 1] + linearSlope(excesses))
    : null;

  // Growth index (indexed to 100 at first year)
  const growthIndex = years.map((y, i) => ({
    year: y.year,
    revenueIndex: revenues.length > 0 && revenues[0] > 0 && y.revenue != null
      ? Math.round((y.revenue / revenues[0]) * 100)
      : null,
    inventoryIndex: inventories.length > 0 && inventories[0] > 0 && y.inventory != null
      ? Math.round((y.inventory / inventories[0]) * 100)
      : null,
  }));

  return {
    years,
    growthIndex,
    dioTrend,
    dioSlope: Math.round(dioSlope * 10) / 10,
    revenueCAGR,
    inventoryCAGR,
    latestExcess,
    projectedExcess,
    medianDIO,
  };
}

function emptyTrends() {
  return {
    years: [],
    growthIndex: [],
    dioTrend: 'stable',
    dioSlope: 0,
    revenueCAGR: null,
    inventoryCAGR: null,
    latestExcess: null,
    projectedExcess: null,
    medianDIO: null,
  };
}

/** Sum of values, treating null as 0 */
function sum(...vals) {
  const valid = vals.filter((v) => v != null);
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) : null;
}

/** Compound annual growth rate */
function cagr(start, end, periods) {
  if (start <= 0 || end <= 0 || periods <= 0) return null;
  return Math.round((Math.pow(end / start, 1 / periods) - 1) * 1000) / 10; // returns as %
}

/** Simple linear slope of values (units per index step) */
function linearSlope(values) {
  const n = values.length;
  if (n < 2) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}
