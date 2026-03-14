import { formatCr } from '../utils/formatCurrency';
import ConvictionBadge from './ConvictionBadge';

const GAP_CONFIG = [
  { key: 'gap3', label: 'Excess Capital Trapped', color: 'border-red-400' },
  { key: 'gap4', label: 'Value Destroyed', color: 'border-orange-400' },
  { key: 'gap2', label: 'Cost Incurred', color: 'border-amber-400' },
  { key: 'gap1', label: 'Revenue Lost', color: 'border-blue-400' },
];

export default function MiniGapCards({ gaps }) {
  const activeGaps = GAP_CONFIG.filter((g) => gaps[g.key] != null);
  if (activeGaps.length === 0) return null;

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(activeGaps.length, 4)}, minmax(0, 1fr))` }}>
      {activeGaps.map(({ key, label, color }) => {
        const gap = gaps[key];
        const conviction = gap.isDirectInput ? 'calculated' : (key === 'gap3' || key === 'gap4') ? 'solid' : 'estimated';
        return (
          <div key={key} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${color} p-3`}>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-lg font-bold text-gray-900">{formatCr(gap.value)}</p>
            <ConvictionBadge type={conviction} />
          </div>
        );
      })}
    </div>
  );
}
