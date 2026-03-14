import { useState } from 'react';
import benchmarkDefaults from '../data/benchmarks.json';
import { saveCustomIndustry, deleteCustomIndustry, exportCustomIndustries, importCustomIndustries, getCustomIndustries } from '../logic/customIndustries';

const FIELD_LABELS = {
  grossMargin: { label: 'Gross Margin', display: (v) => `${(v * 100).toFixed(0)}%`, toStored: (v) => v / 100, fromStored: (v) => v * 100 },
  medianDIO: { label: 'Median DIO', display: (v) => `${v} days` },
  bestInClassDIO: { label: 'Best-in-Class DIO', display: (v) => `${v} days` },
  typicalMAPE: { label: 'Typical MAPE', display: (v) => `${v}%` },
  bestInClassMAPE: { label: 'Best-in-Class MAPE', display: (v) => `${v}%` },
  freightPctOfCOGS: { label: 'Freight % of COGS', display: (v) => `${(v * 100).toFixed(0)}%`, toStored: (v) => v / 100, fromStored: (v) => v * 100 },
  expeditedPctOfFreight: { label: 'Expedited % of Freight', display: (v) => `${(v * 100).toFixed(0)}%`, toStored: (v) => v / 100, fromStored: (v) => v * 100 },
  carryingCostRate: { label: 'Carrying Cost Rate', display: (v) => `${(v * 100).toFixed(0)}%`, toStored: (v) => v / 100, fromStored: (v) => v * 100 },
  lostSalesRate: { label: 'Lost Sales Rate', display: (v) => `${(v * 100).toFixed(1)}%`, toStored: (v) => v / 100, fromStored: (v) => v * 100 },
  writeOffRate: { label: 'Write-off Rate', display: (v) => `${(v * 100).toFixed(1)}%`, toStored: (v) => v / 100, fromStored: (v) => v * 100 },
  typicalFillRate: { label: 'Typical Fill Rate', display: (v) => `${v}%` },
};

export default function AssumptionsPanel({ industry, benchmarks, overrides, onOverride, onReset, onBack, isCustomIndustry, onRefreshCustom }) {
  const [customName, setCustomName] = useState('');

  if (!industry || !benchmarks) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer transition-colors">
          ← Back to Diagnostic
        </button>
        <p className="text-gray-500">Select an industry to view assumptions.</p>
      </div>
    );
  }

  const defaults = isCustomIndustry
    ? getCustomIndustries()[industry]?.benchmarks || {}
    : benchmarkDefaults[industry]?.benchmarks || {};

  const industryLabel = isCustomIndustry
    ? getCustomIndustries()[industry]?.label || industry
    : benchmarkDefaults[industry]?.label || industry;

  const hasOverrides = Object.keys(overrides).length > 0;

  const handleSaveCustom = () => {
    const mergedBenchmarks = {};
    for (const [key, val] of Object.entries(benchmarks)) {
      mergedBenchmarks[key] = { ...val };
    }
    saveCustomIndustry(industry, customName || industryLabel, mergedBenchmarks);
    if (onRefreshCustom) onRefreshCustom();
  };

  const handleDeleteCustom = () => {
    if (confirm(`Delete custom industry "${industryLabel}"?`)) {
      deleteCustomIndustry(industry);
      if (onRefreshCustom) onRefreshCustom();
      onBack();
    }
  };

  const handleExport = () => {
    const json = exportCustomIndustries();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_industries.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = importCustomIndustries(ev.target.result);
        if (result && onRefreshCustom) onRefreshCustom();
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer transition-colors">
        ← Back to Diagnostic
      </button>

      <h2 className="text-xl font-semibold text-gray-900 mb-1">Assumptions</h2>
      <p className="text-sm text-gray-500 mb-6">
        Benchmark values for {industryLabel}. Edit any value — changes reflect live in the diagnostic.
        {isCustomIndustry && <span className="ml-1 text-xs text-teal-600 font-medium">(Custom)</span>}
      </p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Assumption</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide w-28">Value</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Source</th>
              <th className="px-5 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(FIELD_LABELS).map(([key, meta]) => {
              const defaultVal = defaults[key]?.value;
              const currentVal = benchmarks[key]?.value;
              const isModified = overrides[key] !== undefined;
              const displayValue = meta.fromStored ? meta.fromStored(currentVal) : currentVal;

              return (
                <tr key={key} className="border-b border-gray-100 last:border-0">
                  <td className="px-5 py-3 text-gray-700">
                    {meta.label}
                    {isModified && (
                      <span className="ml-2 text-xs text-amber-500 font-medium">Modified</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      value={displayValue ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value ? Number(e.target.value) : defaultVal;
                        const stored = meta.toStored ? meta.toStored(raw) : raw;
                        onOverride(key, stored);
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      step="any"
                    />
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {defaults[key]?.source || '—'}
                  </td>
                  <td className="px-5 py-3">
                    {isModified && (
                      <button
                        onClick={() => onOverride(key, undefined)}
                        className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {hasOverrides && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Reset to Industry Defaults
          </button>
        )}

        {isCustomIndustry && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={industryLabel}
                className="input-field w-40 text-sm"
              />
              <button
                onClick={handleSaveCustom}
                className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
            <button
              onClick={handleDeleteCustom}
              className="px-4 py-2 text-sm text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </>
        )}

        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Export JSON
        </button>
        <button
          onClick={handleImport}
          className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Import JSON
        </button>
      </div>
    </div>
  );
}
