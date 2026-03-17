import { useState, useMemo } from 'react';
import benchmarkData from '../data/benchmarks.json';
import { parseCSVText, parseCSVFile, autoDetectColumns, extractYearsData } from '../utils/csvParser';
import { calculateTrends } from '../logic/trendCalculations';
import { generateFindings } from '../logic/trendNarratives';
import { DIOTrendChart, GrowthIndexChart, ExcessBarChart } from './TrendCharts';
import TrendFindings from './TrendFindings';
import { formatCr } from '../utils/formatCurrency';

const INDUSTRIES = Object.entries(benchmarkData)
  .filter(([, v]) => v.ready !== false)
  .map(([key, v]) => ({ value: key, label: v.label }));

export default function DeepDiagnosisTab({ inputs }) {
  const [industry, setIndustry] = useState(inputs.industry || '');
  const [inputMode, setInputMode] = useState('paste');
  const [pasteText, setPasteText] = useState('');
  const [parsedData, setParsedData] = useState(null); // { headers, rows }
  const [columnMap, setColumnMap] = useState(null);
  const [yearsData, setYearsData] = useState([]); // [{ year, revenue, cogs, inventory }]
  const [error, setError] = useState(null);
  const [showMapper, setShowMapper] = useState(false);

  const benchmarks = industry ? benchmarkData[industry]?.benchmarks : null;

  // Calculate trends from editable yearsData
  const trendResults = useMemo(
    () => calculateTrends(yearsData, benchmarks),
    [yearsData, benchmarks],
  );
  const findings = useMemo(
    () => generateFindings(trendResults),
    [trendResults],
  );

  const hasData = yearsData.length > 0;

  // --- Process pasted/uploaded data ---
  function processData(parsed) {
    setError(null);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    setParsedData(parsed);
    const detected = autoDetectColumns(parsed.headers);

    if (!detected) {
      setShowMapper(true);
      // Initialize column map with first columns
      setColumnMap({
        yearCol: 0,
        revenueCol: parsed.headers.length > 1 ? 1 : 0,
        cogsCol: parsed.headers.length > 2 ? 2 : null,
        inventoryCol: parsed.headers.length > 3 ? 3 : 0,
      });
      return;
    }

    setColumnMap(detected);
    const data = extractYearsData(parsed.rows, detected);
    if (data.length === 0) {
      setError('No valid data rows found. Check that your data has numeric values.');
      return;
    }
    setYearsData(data);
    setShowMapper(false);
  }

  function handlePaste() {
    const parsed = parseCSVText(pasteText);
    processData(parsed);
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const parsed = await parseCSVFile(file);
    processData(parsed);
  }

  function handleConfirmMapping() {
    if (!parsedData || !columnMap) return;
    const data = extractYearsData(parsedData.rows, columnMap);
    if (data.length === 0) {
      setError('No valid data rows found with selected columns.');
      return;
    }
    setYearsData(data);
    setShowMapper(false);
    setError(null);
  }

  function handleReset() {
    setParsedData(null);
    setColumnMap(null);
    setYearsData([]);
    setError(null);
    setShowMapper(false);
    setPasteText('');
  }

  function updateYearField(index, field, value) {
    setYearsData((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value === '' ? null : Number(value) } : row,
      ),
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      {/* Industry selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Industry
        </label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="input-field text-sm py-1.5"
        >
          <option value="">Select industry...</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind.value} value={ind.value}>{ind.label}</option>
          ))}
        </select>
      </div>

      {/* Upload section — only if no data yet */}
      {!hasData && !showMapper && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Upload Financial Data
          </h2>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputMode('paste')}
              className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
                inputMode === 'paste'
                  ? 'bg-teal-50 border-teal-200 text-teal-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Paste data
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
                inputMode === 'upload'
                  ? 'bg-teal-50 border-teal-200 text-teal-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Upload CSV / Excel
            </button>
          </div>

          {inputMode === 'paste' && (
            <div className="space-y-3">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Paste your data here (tab or comma separated):\n\nYear\tRevenue\tCOGS\tInventory\nFY21\t7638\t4593\t980\nFY22\t9512\t6158\t1163\n...`}
                className="input-field w-full h-40 text-sm font-mono resize-y"
              />
              <button
                onClick={handlePaste}
                disabled={!pasteText.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Process Data
              </button>
            </div>
          )}

          {inputMode === 'upload' && (
            <div className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-50 file:cursor-pointer"
                />
              </label>
              <p className="text-xs text-gray-400">
                Supports CSV with columns: Year, Revenue, COGS, Inventory
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <p className="mt-4 text-xs text-gray-400">
            Supports: Screener.in export, annual report data, or any CSV with Revenue, COGS, Inventory columns by year.
          </p>
        </div>
      )}

      {/* Column mapper */}
      {showMapper && parsedData && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Map your columns
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            We couldn't auto-detect your column layout. Please map each field:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {['yearCol', 'revenueCol', 'cogsCol', 'inventoryCol'].map((key) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 w-20">
                  {key.replace('Col', '').replace(/([A-Z])/g, ' $1').trim()}:
                </label>
                <select
                  value={columnMap?.[key] ?? ''}
                  onChange={(e) =>
                    setColumnMap((prev) => ({
                      ...prev,
                      [key]: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  className="input-field text-xs py-1 flex-1"
                >
                  <option value="">— skip —</option>
                  {parsedData.headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleConfirmMapping}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 cursor-pointer"
            >
              Confirm & Process
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
          {error && (
            <div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Data processed — metrics table + charts + findings */}
      {hasData && (
        <>
          {/* Section 1: Editable Metrics Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Key Metrics Extracted
              </h2>
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ↻ Upload different data
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 py-2 pr-4 w-28"></th>
                    {yearsData.map((y, i) => (
                      <th key={i} className="text-center text-xs font-semibold text-gray-700 py-2 px-2 min-w-[80px]">
                        {y.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'revenue', label: 'Revenue', format: true },
                    { key: 'cogs', label: 'COGS', format: true },
                    { key: 'inventory', label: 'Inventory', format: true },
                  ].map(({ key, label }) => (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="text-xs font-medium text-gray-500 py-2 pr-4">{label}</td>
                      {yearsData.map((y, i) => (
                        <td key={i} className="py-1 px-1 text-center">
                          <input
                            type="number"
                            value={y[key] ?? ''}
                            onChange={(e) => updateYearField(i, key, e.target.value)}
                            className="input-field w-full text-xs text-center py-1"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Computed rows (read-only) */}
                  {trendResults.years.length > 0 && (
                    <>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="text-xs font-medium text-gray-500 py-2 pr-4">DIO</td>
                        {trendResults.years.map((y, i) => (
                          <td key={i} className="text-xs text-center py-2 font-semibold text-gray-700">
                            {y.dio ?? '—'}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="text-xs font-medium text-gray-500 py-2 pr-4">Gross %</td>
                        {trendResults.years.map((y, i) => (
                          <td key={i} className="text-xs text-center py-2 text-gray-600">
                            {y.grossPct != null ? `${y.grossPct}%` : '—'}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] text-gray-400">
              All values editable — correct any auto-extracted numbers. DIO and Gross % auto-calculate.
            </p>
          </div>

          {/* Section 2: Charts */}
          {trendResults.years.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5 space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Trend Diagnosis
              </h2>

              <DIOTrendChart data={trendResults.years} medianDIO={trendResults.medianDIO} />
              <GrowthIndexChart data={trendResults.growthIndex} />
              <ExcessBarChart data={trendResults.years} />

              {!benchmarks && (
                <p className="text-sm text-amber-600">
                  Select an industry above to see excess inventory calculations and benchmark comparisons.
                </p>
              )}
            </div>
          )}

          {/* Section 3: Findings */}
          {trendResults.years.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                Diagnosis Summary
              </h2>
              <TrendFindings
                findings={findings}
                latestYear={trendResults.years.length > 0 ? trendResults.years[trendResults.years.length - 1] : null}
              />
              {!benchmarks && (
                <p className="text-sm text-amber-600 mt-3">
                  Select an industry above to see benchmark comparisons, cost breakdown, and full trend analysis.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
