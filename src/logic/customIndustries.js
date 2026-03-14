const STORAGE_KEY = 'vlc_custom_industries';

const DEFAULT_BENCHMARKS = {
  bestInClassMAPE: { value: 25, unit: '%', source: 'Custom' },
  typicalMAPE: { value: 40, unit: '%', source: 'Custom' },
  medianDIO: { value: 60, unit: 'days', source: 'Custom' },
  bestInClassDIO: { value: 35, unit: 'days', source: 'Custom' },
  typicalFillRate: { value: 95, unit: '%', source: 'Custom' },
  grossMargin: { value: 0.35, unit: 'ratio', source: 'Custom' },
  carryingCostRate: { value: 0.18, unit: 'ratio', source: 'Custom' },
  writeOffRate: { value: 0.02, unit: 'ratio', source: 'Custom' },
  freightPctOfCOGS: { value: 0.05, unit: 'ratio', source: 'Custom' },
  expeditedPctOfFreight: { value: 0.15, unit: 'ratio', source: 'Custom' },
  lostSalesRate: { value: 0.03, unit: 'ratio', source: 'Custom' },
};

export function getCustomIndustries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveCustomIndustry(key, label, benchmarks) {
  const all = getCustomIndustries();
  all[key] = { label, ready: true, benchmarks, custom: true };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

export function deleteCustomIndustry(key) {
  const all = getCustomIndustries();
  delete all[key];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

export function exportCustomIndustries() {
  return JSON.stringify(getCustomIndustries(), null, 2);
}

export function importCustomIndustries(json) {
  try {
    const parsed = JSON.parse(json);
    const all = getCustomIndustries();
    Object.assign(all, parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return all;
  } catch {
    return null;
  }
}

export function getDefaultBenchmarks() {
  return JSON.parse(JSON.stringify(DEFAULT_BENCHMARKS));
}
