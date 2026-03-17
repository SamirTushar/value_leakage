import { useState, useCallback } from 'react';
import { EXAMPLES } from './data/examples';
import benchmarkData from './data/benchmarks.json';
import { calculateAll } from './logic/calculations';
import { generateNarratives } from './logic/narratives';
import { exampleToInputs, EMPTY_INPUTS, getModuleOptions, hasCustomData } from './logic/mapExample';

import ExampleSelector from './components/ExampleSelector';
import CompanyCard from './components/CompanyCard';
import StepCard from './components/StepCard';
import EffectContent from './components/EffectContent';
import CauseContent from './components/CauseContent';
import CompensationContent from './components/CompensationContent';
import CostContent from './components/CostContent';
import ModuleConnection from './components/ModuleConnection';
import AssumptionsTable from './components/AssumptionsTable';
import ROISummary from './components/ROISummary';

const STEP_COLORS = {
  effect: '#3B82F6',
  cause: '#F59E0B',
  compensation: '#D97706',
  cost: '#0D9488',
};

const TABS = [
  { id: 'diagnostic', label: 'Diagnostic' },
  { id: 'assumptions', label: 'Assumptions' },
  { id: 'roi', label: 'ROI' },
];

function App() {
  const [selectedId, setSelectedId] = useState(EXAMPLES[0].id);
  const [inputs, setInputs] = useState(() => exampleToInputs(EXAMPLES[0]));
  const [activeTab, setActiveTab] = useState('diagnostic');

  const isCustom = selectedId === 'custom';

  // Look up industry benchmarks
  const industryEntry = inputs.industry ? benchmarkData[inputs.industry] : null;
  const benchmarks = industryEntry?.benchmarks ?? null;

  // Compute everything from inputs + benchmarks
  const results = calculateAll(inputs, benchmarks);
  const narratives = generateNarratives(inputs, results, benchmarks);
  const moduleOptions = getModuleOptions(inputs.diagnosticFocus, inputs.industry);

  const updateInput = useCallback((field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectExample = useCallback((id) => {
    if (isCustom && hasCustomData(inputs)) {
      if (!window.confirm('Switch to this example? Your current inputs will be replaced.')) {
        return;
      }
    }
    setSelectedId(id);
    if (id === 'custom') {
      setInputs({ ...EMPTY_INPUTS });
    } else {
      const ex = EXAMPLES.find((e) => e.id === id);
      if (ex) setInputs(exampleToInputs(ex));
    }
    setActiveTab('diagnostic');
  }, [isCustom, inputs]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">
            Value Diagnostic
          </h1>
          <ExampleSelector
            examples={EXAMPLES}
            selectedId={selectedId}
            onSelect={handleSelectExample}
          />
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
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

      {/* Tab content */}
      {activeTab === 'diagnostic' && (
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          <CompanyCard inputs={inputs} results={results} onInputChange={updateInput} />

          <StepCard step={1} label="Effect" color={STEP_COLORS.effect}>
            <EffectContent
              inputs={inputs}
              results={results}
              narratives={narratives}
              onInputChange={updateInput}
            />
          </StepCard>

          <StepCard step={2} label="Cause" color={STEP_COLORS.cause}>
            <CauseContent
              inputs={inputs}
              results={results}
              narratives={narratives}
              benchmarks={benchmarks}
              onInputChange={updateInput}
            />
          </StepCard>

          <StepCard step={3} label="Compensation" color={STEP_COLORS.compensation}>
            <CompensationContent
              inputs={inputs}
              results={results}
              narratives={narratives}
              onInputChange={updateInput}
            />
          </StepCard>

          <StepCard step={4} label="Cost" color={STEP_COLORS.cost}>
            <CostContent
              inputs={inputs}
              results={results}
              onInputChange={updateInput}
            />
          </StepCard>

          <ModuleConnection
            connections={moduleOptions}
            selectedIndex={inputs.selectedModuleAnswer}
            onSelect={(idx) => updateInput('selectedModuleAnswer', idx)}
          />
        </div>
      )}

      {activeTab === 'assumptions' && (
        <AssumptionsTable industry={inputs.industry} benchmarks={benchmarks} />
      )}

      {activeTab === 'roi' && (
        <ROISummary inputs={inputs} results={results} onInputChange={updateInput} />
      )}
    </div>
  );
}

export default App;
