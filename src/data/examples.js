export const EXAMPLES = [
  {
    id: 'marico',
    name: 'Marico',
    subtitle: 'FMCG, Listed',
    industry: 'FMCG',
    source: 'Screener.in, FY24 Consolidated',
    revenue: 9764,
    cogs: 5956,
    inventory: 1271,

    trendData: [
      { year: 'FY21', revenue: 7638, cogs: 4593, inventory: 980 },
      { year: 'FY22', revenue: 9512, cogs: 6158, inventory: 1163 },
      { year: 'FY23', revenue: 9764, cogs: 5956, inventory: 1271 },
      { year: 'FY24', revenue: 9828, cogs: 5890, inventory: 1198 },
      { year: 'FY25', revenue: 11039, cogs: 6505, inventory: 1350 },
    ],

    diagnosticFocus: 'dio',

    effect: {
      metric: 'DIO',
      value: 78,
      unit: 'days',
      benchmark: { median: 60, best: 45 },
      gap: 18,
      excessInventory: 294,
      narrative:
        'Marico carries 78 days of inventory. FMCG median is 60 days. That\u2019s 18 extra days \u2014 \u20B9294 Cr sitting in excess stock.',
    },

    cause: {
      driver: 'Forecast Accuracy',
      value: '~45%',
      context: 'at SKU level',
      benchmark: { typical: '48%', best: '30%' },
      narrative:
        'Forecast accuracy at ~45% at SKU level means the demand signal is wrong roughly half the time. Everything downstream compensates for this.',
    },

    compensation: {
      items: [
        'Safety stock set at ~2\u00D7 what\u2019s mathematically needed to buffer forecast uncertainty',
        'Fill rate is 97% \u2014 looks healthy, but it\u2019s being bought with \u20B9294 Cr in excess inventory',
        'Expedited freight fills the gaps that even excess stock can\u2019t cover',
      ],
      insight:
        'None of these fix the root cause. They manage the symptom at a cost.',
    },

    costs: [
      { name: 'Excess Carrying Cost', amount: 59, formula: '\u20B9294 Cr \u00D7 20% carrying cost rate', conviction: 'Calculated' },
      { name: 'Write-off Risk', amount: 19, formula: '\u20B91,271 Cr \u00D7 1.5% industry write-off rate', conviction: 'Solid' },
      { name: 'Freight Premium', amount: 36, formula: '\u20B95,956 Cr \u00D7 5% freight \u00D7 12% expedited', conviction: 'Estimated' },
    ],
    totalCost: 114,
    costAsPctRevenue: 1.2,

    moduleConnection: [
      { question: 'Why is the forecast wrong?', rootCause: 'Bad demand signal', module: 'Demand Planning' },
      { question: 'Why the buffer?', rootCause: 'Forecast doesn\u2019t flow to inventory policy', module: 'Demand \u2192 Replenishment handoff' },
      { question: 'Why the freight premium?', rootCause: 'Reactive execution', module: 'Distribution Planning' },
    ],

    assumptions: [
      { metric: 'Median DIO', value: '60 days', source: 'ReadyRatios' },
      { metric: 'Best-in-class DIO', value: '45 days', source: 'ReadyRatios' },
      { metric: 'Typical MAPE', value: '48%', source: 'E2open' },
      { metric: 'Best MAPE', value: '30%', source: 'E2open' },
      { metric: 'Gross Margin', value: '39%', source: 'Screener.in' },
      { metric: 'Carrying Cost Rate', value: '20%', source: 'Industry standard' },
      { metric: 'Freight % of COGS', value: '5%', source: 'CSCMP' },
      { metric: 'Expedited % of Freight', value: '12%', source: 'Industry' },
      { metric: 'Write-off Rate', value: '1.5%', source: 'Industry' },
      { metric: 'Typical Fill Rate', value: '96%', source: 'MetricHQ' },
    ],

    roi: {
      gapClosurePct: 30,
      annualSavings: 34,
      capitalFreed: 88,
      note: 'Conservative: 30% gap closure in Year 1 through better demand planning and dynamic safety stock.',
    },
  },

  {
    id: 'dabur',
    name: 'Dabur',
    subtitle: 'FMCG, Listed',
    industry: 'FMCG',
    source: 'Screener.in / GuruFocus, FY24',
    revenue: 12886,
    cogs: 6350,
    inventory: 2240,

    trendData: [
      { year: 'FY21', revenue: 9562, cogs: 4710, inventory: 1580 },
      { year: 'FY22', revenue: 10889, cogs: 5490, inventory: 1820 },
      { year: 'FY23', revenue: 11530, cogs: 5680, inventory: 2010 },
      { year: 'FY24', revenue: 12886, cogs: 6350, inventory: 2240 },
    ],

    diagnosticFocus: 'dio',

    effect: {
      metric: 'DIO',
      value: 129,
      unit: 'days',
      benchmark: { median: 60, best: 45 },
      gap: 69,
      excessInventory: 1200,
      narrative:
        'Dabur carries 129 days of inventory \u2014 more than double the FMCG median of 60 days. \u20B91,200 Cr in excess stock. Nearly 10% of revenue locked in extra inventory.',
    },

    cause: {
      driver: 'SKU Proliferation + New Categories',
      value: 'Long tail',
      context: 'across ayurvedic, foods, personal care',
      benchmark: { typical: '48%', best: '30%' },
      narrative:
        'Long SKU tail across ayurvedic, foods, personal care. New category expansion (Real juice, Badshah) with unpredictable demand. Raw materials with long lead times (herbs, natural inputs).',
    },

    compensation: {
      items: [
        'Periodic clearance sales destroying margin on slow-moving stock',
        'Gradual quarterly write-offs spreading the pain across periods',
        'High safety stock maintained across the entire product range',
      ],
      insight:
        'The compensation here is expensive. Clearance sales destroy margin. Write-offs destroy value. Safety stock locks up capital.',
    },

    costs: [
      { name: 'Excess Carrying Cost', amount: 240, formula: '\u20B91,200 Cr \u00D7 20% carrying cost rate', conviction: 'Calculated' },
      { name: 'Write-off Risk', amount: 34, formula: '\u20B92,240 Cr \u00D7 1.5% industry write-off rate', conviction: 'Solid' },
      { name: 'Freight Premium', amount: 38, formula: '\u20B96,350 Cr \u00D7 5% freight \u00D7 12% expedited', conviction: 'Estimated' },
    ],
    totalCost: 312,
    costAsPctRevenue: 2.4,

    moduleConnection: [
      { question: 'Why so many SKUs with excess?', rootCause: 'SKU proliferation + new product forecasting', module: 'Demand Planning' },
      { question: 'Why long lead time buffering?', rootCause: 'Natural/herbal inputs with variable supply', module: 'Material Planning' },
      { question: 'Why clearance sales?', rootCause: 'No integrated demand-supply matching', module: 'Full Planning Chain' },
    ],

    assumptions: [
      { metric: 'Median DIO', value: '60 days', source: 'ReadyRatios' },
      { metric: 'Best-in-class DIO', value: '45 days', source: 'ReadyRatios' },
      { metric: 'Typical MAPE', value: '48%', source: 'E2open' },
      { metric: 'Best MAPE', value: '30%', source: 'E2open' },
      { metric: 'Gross Margin', value: '39%', source: 'Screener.in' },
      { metric: 'Carrying Cost Rate', value: '20%', source: 'Industry standard' },
      { metric: 'Freight % of COGS', value: '5%', source: 'CSCMP' },
      { metric: 'Expedited % of Freight', value: '12%', source: 'Industry' },
      { metric: 'Write-off Rate', value: '1.5%', source: 'Industry' },
      { metric: 'Typical Fill Rate', value: '96%', source: 'MetricHQ' },
    ],

    roi: {
      gapClosurePct: 30,
      annualSavings: 94,
      capitalFreed: 360,
      note: 'Conservative: 30% gap closure in Year 1. Even modest improvement on a \u20B91,200 Cr excess base yields significant returns.',
    },
  },

  {
    id: 'manufacturer',
    name: '\u20B9500 Cr Manufacturer',
    subtitle: 'Industrial Manufacturing, Unlisted',
    industry: 'Manufacturing',
    source: '2 questions on the call',
    revenue: 500,
    cogs: 350,
    inventory: 129,

    trendData: [
      { year: 'FY22', revenue: 420, cogs: 294, inventory: 105 },
      { year: 'FY23', revenue: 460, cogs: 322, inventory: 118 },
      { year: 'FY24', revenue: 500, cogs: 350, inventory: 129 },
    ],

    diagnosticFocus: 'dio',

    effect: {
      metric: 'DIO',
      value: 135,
      unit: 'days',
      benchmark: { median: 106, best: 75 },
      gap: 29,
      excessInventory: 28,
      narrative:
        'DIO of 135 days \u2014 29 above the manufacturing median of 106 days. \u20B928 Cr in excess inventory. OEE at 65% \u2014 performance component is the weak link, not availability or quality.',
    },

    cause: {
      driver: 'Reactive Production Scheduling',
      value: 'Weekly changes',
      context: 'based on urgent customer orders',
      benchmark: { typical: 'Stable weekly plan', best: 'Frozen 2-week horizon' },
      narrative:
        'Production schedule is reactive. Changes weekly based on urgent customer orders. Planning horizon is shorter than procurement lead time. This creates a cascade of waste.',
    },

    compensation: {
      items: [
        'Raw material buffer because production plan keeps changing',
        'Overtime and weekend shifts to catch up after schedule disruptions',
        'Suppliers penalized with frequent PO changes and emergency orders',
      ],
      insight:
        'The factory runs in firefighting mode. Every compensation adds cost and erodes supplier relationships.',
    },

    costs: [
      { name: 'Excess Carrying Cost', amount: 5, formula: '\u20B928 Cr \u00D7 18% carrying cost rate', conviction: 'Calculated' },
      { name: 'Emergency Procurement Premium', amount: 3, formula: 'Estimated from PO change frequency', conviction: 'Estimated' },
      { name: 'Overtime Premium', amount: 2, formula: 'Estimated from weekend shift patterns', conviction: 'Estimated' },
    ],
    totalCost: 10,
    costAsPctRevenue: 2.0,

    moduleConnection: [
      { question: 'Why is production reactive?', rootCause: 'No stable demand signal reaching production', module: 'Demand \u2192 Production handoff' },
      { question: 'Why emergency procurement?', rootCause: 'Unstable POs from schedule changes', module: 'Material Planning' },
      { question: 'Why overtime?', rootCause: 'Reactive schedule can\u2019t optimize capacity', module: 'Production Planning' },
    ],

    assumptions: [
      { metric: 'Median DIO', value: '106 days', source: 'ReadyRatios' },
      { metric: 'Best-in-class DIO', value: '75 days', source: 'ReadyRatios' },
      { metric: 'Typical MAPE', value: '45%', source: 'Industry estimate' },
      { metric: 'Best MAPE', value: '28%', source: 'Industry estimate' },
      { metric: 'Gross Margin', value: '30%', source: 'Estimated' },
      { metric: 'Carrying Cost Rate', value: '18%', source: 'Industry standard' },
      { metric: 'Freight % of COGS', value: '4%', source: 'CSCMP' },
      { metric: 'Expedited % of Freight', value: '10%', source: 'Industry' },
      { metric: 'Write-off Rate', value: '1.0%', source: 'Industry' },
      { metric: 'Typical Fill Rate', value: '94%', source: 'Industry estimate' },
    ],

    roi: {
      gapClosurePct: 30,
      annualSavings: 3,
      capitalFreed: 8,
      note: 'Conservative: 30% gap closure in Year 1. Small absolute numbers, but 2% of revenue is significant for a \u20B9500 Cr company.',
    },
  },

  {
    id: 'pharma',
    name: '\u20B93,000 Cr Pharma Company',
    subtitle: 'Pharmaceuticals, Aging Focus',
    industry: 'Pharma',
    source: 'Hypothetical using nVentic benchmarks',
    revenue: 3000,
    cogs: 1500,
    inventory: 750,

    trendData: [
      { year: 'FY21', revenue: 2200, cogs: 1100, inventory: 520 },
      { year: 'FY22', revenue: 2500, cogs: 1250, inventory: 610 },
      { year: 'FY23', revenue: 2750, cogs: 1375, inventory: 680 },
      { year: 'FY24', revenue: 3000, cogs: 1500, inventory: 750 },
    ],

    diagnosticFocus: 'aging',

    effect: {
      metric: 'Near-Expiry Inventory',
      value: 182,
      unit: 'days',
      benchmark: { median: 180, best: 120 },
      gap: 2,
      excessInventory: 135,
      nearExpiryPct: 18,
      narrative:
        'DIO is 182 days \u2014 right at the pharma median of 180 days. Looks fine. But 18% of inventory (\u20B9135 Cr) is within 6 months of expiry. DIO alone misses this entirely.',
    },

    cause: {
      driver: 'Overproduction + Batch Economics',
      value: 'Batch-driven',
      context: 'manufacturing economics over demand',
      benchmark: { typical: 'Demand-aligned batches', best: 'Dynamic batch sizing' },
      narrative:
        'Overproduction to ensure availability. Batch sizes driven by manufacturing economics, not demand. New molecule launches with uncertain uptake create the aging tail.',
    },

    compensation: {
      items: [
        'Near-expiry stock dumped to hospitals at deep discounts (40-60% off)',
        'Free goods schemes to push stock through distributors before expiry',
        'Quarterly destruction of expired stock with regulatory disposal costs',
      ],
      insight:
        'The traditional DIO metric says everything is fine. The aging profile tells a completely different story.',
    },

    costs: [
      { name: 'Destroyed Stock', amount: 41, formula: '~30% of \u20B9135 Cr near-expiry destroyed', conviction: 'Estimated' },
      { name: 'Margin Destruction (Discounts)', amount: 20, formula: '~30% of near-expiry sold at deep discount', conviction: 'Estimated' },
      { name: 'Carrying Cost on Near-Expiry', amount: 27, formula: '\u20B9135 Cr \u00D7 20% carrying cost rate', conviction: 'Calculated' },
    ],
    totalCost: 88,
    costAsPctRevenue: 2.9,

    moduleConnection: [
      { question: 'Why overproduction?', rootCause: 'Batch sizes driven by cost, not demand', module: 'Production Planning (batch optimization)' },
      { question: 'Why uncertain demand for new molecules?', rootCause: 'No demand sensing for new launches', module: 'Demand Planning' },
      { question: 'Why does DIO look fine but aging doesn\u2019t?', rootCause: 'DIO is an average \u2014 it hides the distribution', module: 'Inventory Analytics' },
    ],

    assumptions: [
      { metric: 'Median DIO', value: '180 days', source: 'nVentic' },
      { metric: 'Best-in-class DIO', value: '120 days', source: 'nVentic' },
      { metric: 'Typical MAPE', value: '50%', source: 'Industry estimate' },
      { metric: 'Best MAPE', value: '35%', source: 'Industry estimate' },
      { metric: 'Gross Margin', value: '50%', source: 'Industry average' },
      { metric: 'Carrying Cost Rate', value: '20%', source: 'Industry standard' },
      { metric: 'Near-Expiry % of Inventory', value: '18%', source: 'nVentic benchmark' },
      { metric: 'Destruction Rate (of near-expiry)', value: '30%', source: 'Industry pattern' },
      { metric: 'Discount Rate (of near-expiry)', value: '30%', source: 'Industry pattern' },
      { metric: 'Write-off Rate', value: '3.0%', source: 'nVentic' },
    ],

    roi: {
      gapClosurePct: 30,
      annualSavings: 26,
      capitalFreed: 41,
      note: 'Conservative: 30% reduction in near-expiry inventory through better batch sizing and demand-aligned production.',
    },
  },
];
