import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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

export default function MonthlyChart({ monthlyData = [] }) {
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
        6-Month Comparison Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={monthlyData}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-success-500)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-success-500)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-danger-500)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-danger-500)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-color)"
            vertical={false}
          />
          <XAxis
            dataKey="shortMonth"
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
          <Tooltip content={<CustomTooltip />} />
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
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="var(--color-success-500)"
            strokeWidth={2}
            fill="url(#incomeGrad)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="var(--color-danger-500)"
            strokeWidth={2}
            fill="url(#expenseGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
