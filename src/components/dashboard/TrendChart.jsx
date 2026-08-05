import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
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
        <p
          className="font-medium mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
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

export default function TrendChart({ dailyTrend = [] }) {
  if (dailyTrend.length === 0) {
    return (
      <div
        className="p-6 rounded-lg"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        <h3
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Daily Expense Trend
        </h3>
        <p
          className="text-sm text-center py-12"
          style={{ color: 'var(--text-tertiary)' }}
        >
          No data available yet
        </p>
      </div>
    );
  }

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
        Daily Expense Trend
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={dailyTrend}>
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
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
            dataKey="date"
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${CURRENCY}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="var(--color-danger-500)"
            strokeWidth={2}
            fill="url(#expenseGradient)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
