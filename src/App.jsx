import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import InsightSection from './components/InsightSection';
import DetailedBreakdown from './components/DetailedBreakdown';
import AssumptionsPanel from './components/AssumptionsPanel';
import benchmarkData from './data/benchmarks.json';
import { adjustAccuracy } from './logic/adjustments';
import { calculateAll } from './logic/calculations';
import { detectContradictions } from './logic/contradictions';
import { generateCommentary, getApiKey } from './logic/llmCommentary';
import { getCustomIndustries } from './logic/customIndustries';

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
  const [customIndustries, setCustomIndustries] = useState(() => getCustomIndustries());
  const [llmParagraph, setLlmParagraph] = useState(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const debounceRef = useRef(null);

  // Merge standard + custom industries for lookup
  const allIndustries = useMemo(() => {
    return { ...benchmarkData, ...customIndustries };
  }, [customIndustries]);

  const benchmarks = useMemo(() => {
    if (!inputs.industry || !allIndustries[inputs.industry]) return null;
    const base = allIndustries[inputs.industry].benchmarks;
    const merged = {};
    for (const [key, val] of Object.entries(base)) {
      merged[key] = overrides[key] !== undefined
        ? { ...val, value: overrides[key] }
        : { ...val };
    }
    return merged;
  }, [inputs.industry, overrides, allIndustries]);

  const industryLabel = inputs.industry ? allIndustries[inputs.industry]?.label : '';

  // Adjusted accuracy
  const adjustedAccuracyVal = useMemo(() => {
    if (inputs.reportedAccuracy != null && inputs.reportedAccuracy !== '') {
      return adjustAccuracy(Number(inputs.reportedAccuracy), inputs.accuracyLevel);
    }
    if (benchmarks) return benchmarks.typicalMAPE.value;
    return null;
  }, [inputs.reportedAccuracy, inputs.accuracyLevel, benchmarks]);

  // Effective inputs
  const effectiveInputs = useMemo(() => {
    if (!benchmarks) return { ...inputs, industryLabel };

    let effectiveCOGS = inputs.cogs;
    if ((effectiveCOGS == null || effectiveCOGS === '') && inputs.revenue && inputs.companyType === 'Unlisted') {
      effectiveCOGS = inputs.revenue * (1 - benchmarks.grossMargin.value);
    }

    let effectiveDIO = inputs.dio;
    if ((effectiveDIO == null || effectiveDIO === '') && inputs.inventoryValue && effectiveCOGS) {
      effectiveDIO = Math.round((inputs.inventoryValue / effectiveCOGS) * 365);
    }

    return {
      ...inputs,
      cogs: effectiveCOGS != null ? Number(effectiveCOGS) : null,
      dio: effectiveDIO != null ? Number(effectiveDIO) : null,
      fillRate: inputs.fillRate != null ? Number(inputs.fillRate) : null,
      adjustedAccuracy: adjustedAccuracyVal,
      industryLabel,
    };
  }, [inputs, benchmarks, adjustedAccuracyVal, industryLabel]);

  const calcInputs = useMemo(() => {
    if (!benchmarks) return effectiveInputs;
    return {
      ...effectiveInputs,
      fillRate: effectiveInputs.fillRate ?? benchmarks.typicalFillRate.value,
    };
  }, [effectiveInputs, benchmarks]);

  const gaps = useMemo(() => {
    if (!benchmarks || !calcInputs.revenue) return {};
    return calculateAll(calcInputs, benchmarks);
  }, [calcInputs, benchmarks]);

  const contradictions = useMemo(() => {
    if (!benchmarks) return [];
    if (effectiveInputs.fillRate == null) return [];
    return detectContradictions(effectiveInputs, benchmarks);
  }, [effectiveInputs, benchmarks]);

  // LLM commentary with 1s debounce
  useEffect(() => {
    if (!getApiKey() || !benchmarks || !effectiveInputs.revenue) {
      setLlmParagraph(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLlmLoading(true);
      const result = await generateCommentary(effectiveInputs, gaps, contradictions, benchmarks);
      setLlmParagraph(result);
      setLlmLoading(false);
    }, 1000);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [effectiveInputs, gaps, contradictions, benchmarks]);

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

  const refreshCustomIndustries = useCallback(() => {
    setCustomIndustries(getCustomIndustries());
  }, []);

  const hasDIO = effectiveInputs.dio != null && effectiveInputs.dio !== '';

  const tabs = [
    { id: 'diagnostic', label: 'Diagnostic' },
    { id: 'breakdown', label: 'Breakdown', disabled: !hasDIO },
    { id: 'assumptions', label: 'Assumptions' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        companyName={inputs.companyName}
        companyType={inputs.companyType}
        industry={inputs.industry}
        revenue={inputs.revenue}
        onUpdate={handleUpdate}
        customIndustries={customIndustries}
      />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setView(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab.disabled
                    ? 'border-transparent text-gray-300 cursor-not-allowed'
                    : view === tab.id
                      ? 'border-teal-600 text-teal-600 cursor-pointer'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer'
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
          <InsightSection
            inputs={effectiveInputs}
            benchmarks={benchmarks}
            contradictions={contradictions}
            gaps={gaps}
            hasDIO={hasDIO}
            onViewBreakdown={() => setView('breakdown')}
            llmParagraph={llmParagraph}
            llmLoading={llmLoading}
          />
          <InputSection
            inputs={effectiveInputs}
            benchmarks={benchmarks}
            onUpdate={handleUpdate}
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
          isCustomIndustry={!!customIndustries[inputs.industry]}
          onRefreshCustom={refreshCustomIndustries}
        />
      )}
    </div>
  );
}

export default App;
