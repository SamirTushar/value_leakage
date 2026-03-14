import { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import RunningCommentary from './components/RunningCommentary';
import TotalDisplay from './components/TotalDisplay';
import DetailedBreakdown from './components/DetailedBreakdown';
import AssumptionsPanel from './components/AssumptionsPanel';
import benchmarkData from './data/benchmarks.json';
import { adjustAccuracy } from './logic/adjustments';
import { calculateAll } from './logic/calculations';
import { detectContradictions } from './logic/contradictions';

const INITIAL_INPUTS = {
  companyName: '',
  companyType: 'Listed',
  industry: '',
  revenue: null,
  cogs: null,
  reportedAccuracy: null,
  accuracyLevel: 'SKU-Week',
  dio: null,
  inventoryValue: null,
  fillRate: null,
  expeditedFreight: null,
};

function App() {
  const [view, setView] = useState('diagnostic');
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [overrides, setOverrides] = useState({});

  const benchmarks = useMemo(() => {
    if (!inputs.industry || !benchmarkData[inputs.industry]) return null;
    const base = benchmarkData[inputs.industry].benchmarks;
    const merged = {};
    for (const [key, val] of Object.entries(base)) {
      merged[key] = overrides[key] !== undefined
        ? { ...val, value: overrides[key] }
        : { ...val };
    }
    return merged;
  }, [inputs.industry, overrides]);

  const industryLabel = inputs.industry ? benchmarkData[inputs.industry]?.label : '';

  // Adjusted accuracy
  const adjustedAccuracyVal = useMemo(() => {
    if (inputs.reportedAccuracy != null && inputs.reportedAccuracy !== '') {
      return adjustAccuracy(Number(inputs.reportedAccuracy), inputs.accuracyLevel);
    }
    // Fallback to industry typical for calculations only
    if (benchmarks) return benchmarks.typicalMAPE.value;
    return null;
  }, [inputs.reportedAccuracy, inputs.accuracyLevel, benchmarks]);

  // Effective inputs: auto-fill COGS for unlisted, but NO prefilled diagnostic values
  const effectiveInputs = useMemo(() => {
    if (!benchmarks) return { ...inputs, industryLabel };

    // Auto-COGS for unlisted
    let effectiveCOGS = inputs.cogs;
    if ((effectiveCOGS == null || effectiveCOGS === '') && inputs.revenue && inputs.companyType === 'Unlisted') {
      effectiveCOGS = inputs.revenue * (1 - benchmarks.grossMargin.value);
    }

    // Auto-DIO from inventory value
    let effectiveDIO = inputs.dio;
    if ((effectiveDIO == null || effectiveDIO === '') && inputs.inventoryValue && effectiveCOGS) {
      effectiveDIO = Math.round((inputs.inventoryValue / effectiveCOGS) * 365);
    }

    return {
      ...inputs,
      cogs: effectiveCOGS != null ? Number(effectiveCOGS) : null,
      dio: effectiveDIO != null ? Number(effectiveDIO) : null,
      // fillRate stays as-is — NO prefill. Null means "not entered".
      fillRate: inputs.fillRate != null ? Number(inputs.fillRate) : null,
      adjustedAccuracy: adjustedAccuracyVal,
      industryLabel,
    };
  }, [inputs, benchmarks, adjustedAccuracyVal, industryLabel]);

  // For calculations, use benchmark fallbacks where user hasn't entered values
  const calcInputs = useMemo(() => {
    if (!benchmarks) return effectiveInputs;
    return {
      ...effectiveInputs,
      // Use benchmark fill rate only for gap calculations, not for display
      fillRate: effectiveInputs.fillRate ?? benchmarks.typicalFillRate.value,
    };
  }, [effectiveInputs, benchmarks]);

  const gaps = useMemo(() => {
    if (!benchmarks || !calcInputs.revenue) return {};
    return calculateAll(calcInputs, benchmarks);
  }, [calcInputs, benchmarks]);

  const contradictions = useMemo(() => {
    if (!benchmarks) return [];
    // Only detect contradictions when user has actually entered fill rate
    if (effectiveInputs.fillRate == null) return [];
    return detectContradictions(effectiveInputs, benchmarks);
  }, [effectiveInputs, benchmarks]);

  const handleUpdate = useCallback((updates) => {
    setInputs((prev) => {
      const next = { ...prev, ...updates };
      if (updates.industry !== undefined && updates.industry !== prev.industry) {
        setOverrides({});
      }
      return next;
    });
  }, []);

  const handleOverride = useCallback((key, value) => {
    setOverrides((prev) => {
      if (value === undefined) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const handleResetOverrides = useCallback(() => {
    setOverrides({});
  }, []);

  const tabs = [
    { id: 'diagnostic', label: 'Diagnostic' },
    { id: 'breakdown', label: 'Breakdown' },
    { id: 'assumptions', label: 'Assumptions' },
  ];

  const hasDIO = effectiveInputs.dio != null && effectiveInputs.dio !== '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        companyName={inputs.companyName}
        companyType={inputs.companyType}
        industry={inputs.industry}
        revenue={inputs.revenue}
        onUpdate={handleUpdate}
      />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  view === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {view === 'diagnostic' && (
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
          <InputSection
            inputs={effectiveInputs}
            benchmarks={benchmarks}
            onUpdate={handleUpdate}
          />
          <RunningCommentary
            inputs={effectiveInputs}
            benchmarks={benchmarks}
            contradictions={contradictions}
            gaps={gaps}
          />
          <TotalDisplay
            total={gaps.total}
            totalPctOfRevenue={gaps.totalPctOfRevenue}
            hasDIO={hasDIO}
            onViewBreakdown={() => setView('breakdown')}
          />
        </div>
      )}

      {view === 'breakdown' && (
        <DetailedBreakdown
          inputs={effectiveInputs}
          benchmarks={benchmarks}
          gaps={gaps}
          contradictions={contradictions}
          onBack={() => setView('diagnostic')}
        />
      )}

      {view === 'assumptions' && (
        <AssumptionsPanel
          industry={inputs.industry}
          benchmarks={benchmarks}
          overrides={overrides}
          onOverride={handleOverride}
          onReset={handleResetOverrides}
          onBack={() => setView('diagnostic')}
        />
      )}
    </div>
  );
}

export default App;
