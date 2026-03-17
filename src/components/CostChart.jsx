import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCr } from '../utils/formatCurrency';

const COLORS = ['#0F766E', '#14B8A6', '#2DD4BF', '#5EEAD4'];

export default function CostChart({ items }) {
  const data = items
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      name: item.name,
      value: Number(item.amount.toFixed(1)),
    }));

  if (data.length === 0) return null;

  return (
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={data.length * 52 + 30}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
        >
          <XAxis
            type="number"
            tickFormatter={(v) => `\u20B9${v}`}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={180}
          />
          <Tooltip
            formatter={(value) => [formatCr(value), 'Amount']}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #E5E7EB',
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
