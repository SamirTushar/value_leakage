// Gap calculations — four types of value leakage

export function calculateGap3_ExcessCapital(inputs, benchmarks) {
  // Excess Capital Trapped
  const { cogs, dio } = inputs;
  if (cogs == null || dio == null) return null;

  const medianDIO = benchmarks.medianDIO.value;
  const excessDays = Math.max(0, dio - medianDIO);
  const dailyCOGS = cogs / 365;
  const excessInventory = excessDays * dailyCOGS;
  const carryingCost = excessInventory * benchmarks.carryingCostRate.value;

  return {
    value: carryingCost,
    excessDays,
    dailyCOGS,
    excessInventory,
    carryingCostRate: benchmarks.carryingCostRate.value,
    medianDIO,
  };
}

export function calculateGap4_ValueDestroyed(inputs, benchmarks) {
  // Value Destroyed (write-offs)
  const { cogs, dio } = inputs;
  if (cogs == null || dio == null) return null;

  const inventoryValue = (dio / 365) * cogs;
  const writeOff = inventoryValue * benchmarks.writeOffRate.value;

  return {
    value: writeOff,
    inventoryValue,
    writeOffRate: benchmarks.writeOffRate.value,
  };
}

export function calculateGap2_CostIncurred(inputs, benchmarks) {
  // Cost Unnecessarily Incurred (expedited freight)
  const { cogs, expeditedFreight } = inputs;
  if (cogs == null) return null;

  if (expeditedFreight != null && expeditedFreight !== '') {
    return {
      value: Number(expeditedFreight),
      isDirectInput: true,
    };
  }

  const totalFreight = cogs * benchmarks.freightPctOfCOGS.value;
  const expedited = totalFreight * benchmarks.expeditedPctOfFreight.value;

  return {
    value: expedited,
    isDirectInput: false,
    totalFreight,
    freightPct: benchmarks.freightPctOfCOGS.value,
    expeditedPct: benchmarks.expeditedPctOfFreight.value,
  };
}

export function calculateGap1_RevenueLost(inputs, benchmarks) {
  // Revenue Not Captured (lost sales)
  const { revenue } = inputs;
  if (revenue == null) return null;

  const grossMargin = benchmarks.grossMargin.value;
  const lostSalesRate = benchmarks.lostSalesRate.value;
  const lostMargin = revenue * lostSalesRate * grossMargin;

  return {
    value: lostMargin,
    lostSalesRate,
    grossMargin,
  };
}

export function calculateAll(inputs, benchmarks) {
  const gap3 = calculateGap3_ExcessCapital(inputs, benchmarks);
  const gap4 = calculateGap4_ValueDestroyed(inputs, benchmarks);
  const gap2 = calculateGap2_CostIncurred(inputs, benchmarks);
  const gap1 = calculateGap1_RevenueLost(inputs, benchmarks);

  const gaps = { gap1, gap2, gap3, gap4 };

  let total = 0;
  let hasAnyGap = false;
  for (const g of Object.values(gaps)) {
    if (g != null) {
      total += g.value;
      hasAnyGap = true;
    }
  }

  const gap1Only = gap1 != null && gap2 == null && gap3 == null && gap4 == null;

  return {
    ...gaps,
    total: hasAnyGap ? total : null,
    totalPctOfRevenue: hasAnyGap && inputs.revenue ? (total / inputs.revenue) * 100 : null,
    gap1Only,
  };
}
