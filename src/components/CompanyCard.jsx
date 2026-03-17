import AssumedBadge from './AssumedBadge';
import benchmarkData from '../data/benchmarks.json';

const INDUSTRIES = Object.entries(benchmarkData).map(([key, val]) => ({
  value: key,
  label: val.label,
}));

export default function CompanyCard({ inputs, results, onInputChange }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-6 py-5">
      {/* Row 1: Company name + Industry */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">
            Company
          </label>
          <input
            type="text"
            value={inputs.companyName || ''}
            onChange={(e) => onInputChange('companyName', e.target.value)}
            placeholder="Company name"
            className="input-field w-full"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">
            Industry
          </label>
          <select
            value={inputs.industry || ''}
            onChange={(e) => onInputChange('industry', e.target.value)}
            className="input-field"
          >
            <option value="">Select industry...</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind.value} value={ind.value}>{ind.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Financials */}
      <div className="flex gap-6">
        <NumberField
          label="Revenue"
          value={inputs.revenue}
          onChange={(v) => onInputChange('revenue', v)}
          placeholder="e.g. 9764"
        />
        <div>
          <NumberField
            label="COGS"
            value={inputs.cogs}
            onChange={(v) => onInputChange('cogs', v)}
            placeholder={results.effectiveCOGS ?? 'e.g. 5956'}
          />
          <AssumedBadge
            isAssumed={results.assumed.cogs}
            label={inputs.industry ? `Est. from ${inputs.industry} margin` : 'Assumed'}
          />
        </div>
        <NumberField
          label="Inventory"
          value={inputs.inventory}
          onChange={(v) => onInputChange('inventory', v)}
          placeholder="e.g. 1271"
        />
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">
            Source
          </label>
          <input
            type="text"
            value={inputs.source || ''}
            onChange={(e) => onInputChange('source', e.target.value)}
            placeholder="e.g. Screener.in, FY24"
            className="input-field w-full text-xs"
          />
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">₹</span>
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={placeholder}
          className="input-field w-28 text-sm font-semibold"
        />
        <span className="text-xs text-gray-400">Cr</span>
      </div>
    </div>
  );
}
