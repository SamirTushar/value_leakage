import benchmarkData from '../data/benchmarks.json';

const readyIndustries = Object.entries(benchmarkData).filter(([, v]) => v.ready);

export default function Header({ companyName, companyType, industry, revenue, onUpdate }) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-5">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Value Leakage Diagnostic</h1>

      {/* Company Profile — single row */}
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
            onChange={(e) => onUpdate({ industry: e.target.value })}
            className="input-field min-w-[180px] cursor-pointer"
          >
            <option value="">Select...</option>
            {readyIndustries.map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
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
