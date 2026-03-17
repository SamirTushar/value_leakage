import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend,
} from 'recharts';
import { formatCr } from '../utils/formatCurrency';

const TEAL = '#0F766E';
const TEAL_LIGHT = '#14B8A6';
const BLUE = '#3B82F6';
const ORANGE = '#F59E0B';

const AXIS_STYLE = { fontSize: 11, fill: '#6B7280' };
const TICK_STYLE = { fontSize: 11, fill: '#9CA3AF' };

/** DIO over time with median reference line */
export function DIOTrendChart({ data, medianDIO }) {
  if (!data || data.length === 0) return null;
  const chartData = data.filter((d) => d.dio != null);
  if (chartData.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        DIO Over Time
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
          <XAxis dataKey="year" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false}
            domain={['auto', 'auto']} tickFormatter={(v) => `${v}d`} />
          <Tooltip
            formatter={(v) => [`${v} days`, 'DIO']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
          />
          {medianDIO != null && (
            <ReferenceLine
              y={medianDIO}
              stroke="#9CA3AF"
              strokeDasharray="6 4"
              label={{ value: `Median ${medianDIO}d`, position: 'right', fontSize: 10, fill: '#9CA3AF' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="dio"
            stroke={TEAL}
            strokeWidth={2.5}
            dot={{ r: 4, fill: TEAL }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Revenue vs Inventory growth indexed to 100 */
export function GrowthIndexChart({ data }) {
  if (!data || data.length < 2) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        Inventory vs Revenue Growth (Indexed to 100)
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
          <XAxis dataKey="year" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <ReferenceLine y={100} stroke="#E5E7EB" />
          <Line
            type="monotone"
            dataKey="revenueIndex"
            name="Revenue"
            stroke={BLUE}
            strokeWidth={2}
            dot={{ r: 3, fill: BLUE }}
          />
          <Line
            type="monotone"
            dataKey="inventoryIndex"
            name="Inventory"
            stroke={ORANGE}
            strokeWidth={2}
            dot={{ r: 3, fill: ORANGE }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Excess inventory bar chart by year */
export function ExcessBarChart({ data }) {
  if (!data || data.length === 0) return null;
  const chartData = data.filter((d) => d.excessInventory != null && d.excessInventory > 0);
  if (chartData.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        Excess Inventory by Year
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
          <XAxis dataKey="year" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false}
            tickFormatter={(v) => `₹${v}`} />
          <Tooltip
            formatter={(v) => [formatCr(v), 'Excess']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
          />
          <Bar dataKey="excessInventory" radius={[4, 4, 0, 0]} barSize={36}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={i === chartData.length - 1 ? TEAL : TEAL_LIGHT} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
