/**
 * Maps example data objects to flat inputs state, and provides empty defaults.
 */

export const EMPTY_INPUTS = {
  companyName: '',
  industry: '',
  source: '',
  revenue: null,
  cogs: null,
  inventory: null,
  diagnosticFocus: 'dio',
  dio: null,
  nearExpiryPct: null,
  fillRate: null,
  oee: null,
  oeeAvailability: null,
  oeePerformance: null,
  oeeQuality: null,
  forecastAccuracy: null,
  accuracyLevel: '',
  overrideCarryingCost: null,
  overrideWriteOff: null,
  overrideFreight: null,
  selectedModuleAnswer: 0,
  gapClosurePct: 30,
};

/**
 * Convert a hardcoded example object into the flat inputs state.
 */
export function exampleToInputs(example) {
  // Parse numeric accuracy from strings like "~45%"
  const accStr = example.cause?.value || '';
  const accNum = parseFloat(accStr.replace(/[^0-9.]/g, ''));

  return {
    companyName: example.name || '',
    industry: example.industry || '',
    source: example.source || '',
    revenue: example.revenue,
    cogs: example.cogs,
    inventory: example.inventory,
    diagnosticFocus: example.diagnosticFocus || 'dio',
    dio: example.diagnosticFocus === 'aging' ? example.effect.value : example.effect.value,
    nearExpiryPct: example.effect.nearExpiryPct ?? null,
    fillRate: null, // Not pre-filled — will use benchmark
    oee: null,
    oeeAvailability: null,
    oeePerformance: null,
    oeeQuality: null,
    forecastAccuracy: isNaN(accNum) ? null : accNum,
    accuracyLevel: example.cause?.context?.toLowerCase().includes('sku') ? 'SKU-Week' : '',
    overrideCarryingCost: example.id === 'manufacturer' ? 5 : null,
    overrideWriteOff: example.id === 'manufacturer' ? 3 : null,
    overrideFreight: example.id === 'manufacturer' ? 2 : null,
    selectedModuleAnswer: 0,
    gapClosurePct: example.roi?.gapClosurePct ?? 30,
  };
}

/**
 * Returns module connection options based on diagnostic focus and industry.
 */
export function getModuleOptions(diagnosticFocus, industry) {
  if (diagnosticFocus === 'aging') {
    return [
      { question: 'Why overproduction?', rootCause: 'Batch sizes driven by cost, not demand', module: 'Production Planning (batch optimization)' },
      { question: 'Why uncertain demand for new products?', rootCause: 'No demand sensing for new launches', module: 'Demand Planning' },
      { question: 'Why does DIO look fine but aging doesn\'t?', rootCause: 'DIO is an average — it hides the distribution', module: 'Inventory Analytics' },
    ];
  }

  if (diagnosticFocus === 'oee') {
    return [
      { question: 'Why is production reactive?', rootCause: 'No stable demand signal reaching production', module: 'Demand → Production handoff' },
      { question: 'Why emergency procurement?', rootCause: 'Unstable POs from schedule changes', module: 'Material Planning' },
      { question: 'Why overtime?', rootCause: 'Reactive schedule can\'t optimize capacity', module: 'Production Planning' },
    ];
  }

  if (industry === 'Manufacturing') {
    return [
      { question: 'Why is production reactive?', rootCause: 'No stable demand signal reaching production', module: 'Demand → Production handoff' },
      { question: 'Why emergency procurement?', rootCause: 'Unstable POs from schedule changes', module: 'Material Planning' },
      { question: 'Why overtime?', rootCause: 'Reactive schedule can\'t optimize capacity', module: 'Production Planning' },
    ];
  }

  // Default: FMCG / DIO / generic
  return [
    { question: 'Why is the forecast wrong?', rootCause: 'Bad demand signal', module: 'Demand Planning' },
    { question: 'Why the buffer?', rootCause: 'Forecast doesn\'t flow to inventory policy', module: 'Demand → Replenishment handoff' },
    { question: 'Why the freight premium?', rootCause: 'Reactive execution', module: 'Distribution Planning' },
  ];
}

/**
 * Check if custom inputs have any meaningful data entered.
 */
export function hasCustomData(inputs) {
  return inputs.companyName !== '' ||
    inputs.revenue != null ||
    inputs.cogs != null ||
    inputs.inventory != null;
}
