import { formatCr } from '../utils/formatCurrency';

/**
 * Generate findings from trend analysis results.
 * Returns array of { type: 'warning'|'positive'|'info', text: string }.
 * Max 4 findings.
 */
export function generateFindings(trendResults) {
  if (!trendResults || trendResults.years.length === 0) return [];

  const findings = [];
  const { years, dioTrend, dioSlope, revenueCAGR, inventoryCAGR, latestExcess, projectedExcess, medianDIO } = trendResults;

  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  const nYears = years.length;

  // Rule 1: DIO Trend
  if (firstYear.dio != null && lastYear.dio != null) {
    if (dioTrend === 'rising') {
      findings.push({
        type: 'warning',
        text: `DIO has increased from ${firstYear.dio} to ${lastYear.dio} days over ${nYears} years — inventory efficiency is declining.`,
      });
    } else if (dioTrend === 'falling') {
      findings.push({
        type: 'positive',
        text: `DIO has improved from ${firstYear.dio} to ${lastYear.dio} days over ${nYears} years — positive trend.`,
      });
    } else {
      const position = lastYear.dio > medianDIO ? `${lastYear.dio - medianDIO} days above median` : 'at or below median';
      findings.push({
        type: lastYear.dio > medianDIO ? 'info' : 'positive',
        text: `DIO stable at ~${lastYear.dio} days — ${position}.`,
      });
    }
  }

  // Rule 2: Inventory vs Revenue Growth
  if (revenueCAGR != null && inventoryCAGR != null) {
    const gap = inventoryCAGR - revenueCAGR;
    if (gap > 2) {
      findings.push({
        type: 'warning',
        text: `Inventory is growing ${gap.toFixed(1)}% faster than revenue annually. This gap compounds — excess inventory is accumulating.`,
      });
    } else if (gap < -2) {
      findings.push({
        type: 'positive',
        text: `Revenue outpacing inventory growth (${revenueCAGR}% vs ${inventoryCAGR}% CAGR) — positive efficiency trend.`,
      });
    }
  }

  // Rule 3: Excess Inventory Trend
  const excesses = years.map((y) => y.excessInventory).filter((e) => e != null && e > 0);
  if (excesses.length >= 2) {
    const firstExcess = excesses[0];
    const lastExcessVal = excesses[excesses.length - 1];
    if (lastExcessVal > firstExcess * 1.2) {
      findings.push({
        type: 'warning',
        text: `Excess inventory has grown from ${formatCr(firstExcess)} to ${formatCr(lastExcessVal)} over ${excesses.length} years.`,
      });
    }
  }

  // Rule 4: Projection
  if (projectedExcess != null && latestExcess != null && projectedExcess > latestExcess) {
    const nextYear = incrementYear(lastYear.year);
    findings.push({
      type: 'info',
      text: `At current trajectory, excess inventory will reach ~${formatCr(projectedExcess)} by ${nextYear}.`,
    });
  }

  // Rule 5: Contradiction — DIO rising + revenue flat/declining
  if (dioTrend === 'rising' && revenueCAGR != null && revenueCAGR < 5) {
    if (!findings.some((f) => f.text.includes('Balance sheet'))) {
      findings.push({
        type: 'warning',
        text: `DIO is rising while revenue growth is only ${revenueCAGR}% — the balance sheet is absorbing operational problems.`,
      });
    }
  }

  // Rule 6: Gross margin improving but DIO rising
  if (dioTrend === 'rising' && firstYear.grossPct != null && lastYear.grossPct != null) {
    if (lastYear.grossPct > firstYear.grossPct + 2) {
      findings.push({
        type: 'warning',
        text: `Gross margin improved from ${firstYear.grossPct}% to ${lastYear.grossPct}%, but DIO is rising. Margin improvement is masking growing inventory risk.`,
      });
    }
  }

  return findings.slice(0, 4);
}

/** Increment a year string like "FY24" → "FY25" or "2024" → "2025" */
function incrementYear(yearStr) {
  const num = parseInt(yearStr.replace(/\D/g, ''));
  if (yearStr.toLowerCase().startsWith('fy')) return `FY${num + 1}`;
  return String(num + 1);
}
