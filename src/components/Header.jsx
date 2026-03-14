import { useState } from 'react';
import benchmarkData from '../data/benchmarks.json';
import LLMSettings from './LLMSettings';
import { getDefaultBenchmarks, saveCustomIndustry } from '../logic/customIndustries';

const readyIndustries = Object.entries(benchmarkData).filter(([, v]) => v.ready);

export default function Header({ companyName, companyType, industry, revenue, onUpdate, customIndustries = {} }) {
  const [showSettings, setShowSettings] = useState(false);

  const customEntries = Object.entries(customIndustries).filter(([, v]) => v.ready);

  const handleNewCustom = () => {
    const name = prompt('Enter custom industry name:');
    if (!name) return;
    const key = 'custom_' + name.toLowerCase().replace(/\s+/g, '_');
    saveCustomIndustry(key, name, getDefaultBenchmarks());
    onUpdate({ industry: key });
    // Force refresh by triggering a re-render from parent
    window.location.reload();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Value Leakage Diagnostic</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
          title="AI Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <Field label="Company">
          <input
            type="text"
            value={companyName}
            onChange={(e) => onUpdate({ companyName: e.target.value })}
            placeholder="Company name"
            className="input-field w-40"
          />
        </Field>

        <Field label="Type">
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() => onUpdate({ companyType: 'Listed' })}
              className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                companyType === 'Listed' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Listed
            </button>
            <button
              onClick={() => onUpdate({ companyType: 'Unlisted' })}
              className={`px-3 py-1.5 text-xs font-medium border-l border-gray-300 transition-colors cursor-pointer ${
                companyType === 'Unlisted' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Unlisted
            </button>
          </div>
        </Field>

        <Field label="Industry">
          <select
            value={industry || ''}
            onChange={(e) => {
              if (e.target.value === '__new_custom__') {
                handleNewCustom();
              } else {
                onUpdate({ industry: e.target.value });
              }
            }}
            className="input-field min-w-[180px] cursor-pointer"
          >
            <option value="">Select...</option>
            {readyIndustries.map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
            {customEntries.length > 0 && (
              <optgroup label="Custom">
                {customEntries.map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </optgroup>
            )}
            <option value="__new_custom__">+ Add Custom Industry</option>
          </select>
        </Field>

        <Field label="Revenue (₹ Cr)">
          <input
            type="number"
            value={revenue ?? ''}
            onChange={(e) => onUpdate({ revenue: e.target.value ? Number(e.target.value) : null })}
            placeholder="e.g. 9764"
            className="input-field w-32"
          />
          <p className="text-[10px] text-gray-400 mt-0.5">Annual revenue from latest financials</p>
        </Field>
      </div>

      {showSettings && <LLMSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
