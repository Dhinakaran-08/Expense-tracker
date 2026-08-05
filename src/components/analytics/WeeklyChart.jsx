import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { CURRENCY } from '../../lib/constants';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-3 rounded-xl text-sm"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {CURRENCY}
            {new Intl.NumberFormat('en-IN').format(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function WeeklyChart({ weeklyData = [] }) {
  return (
    <div
      className="p-6 rounded-lg animate-fade-in"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3
        className="text-base font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Weekly Overview (Mon - Sun)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-color)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${CURRENCY}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.4 }} />
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            formatter={(value) => (
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                {value}
              </span>
            )}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="var(--color-success-500)"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="expense"
            name="Expense"
            fill="var(--color-danger-500)"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
