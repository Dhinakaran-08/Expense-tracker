import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { CATEGORY_COLORS, CURRENCY } from '../../lib/constants';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        className="px-4 py-3 rounded-xl text-sm"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {data.name}
        </p>
        <p style={{ color: data.payload.fill }}>
          {CURRENCY}{new Intl.NumberFormat('en-IN').format(data.value)} ({data.payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function SpendingChart({ categoryBreakdown = [] }) {
  if (categoryBreakdown.length === 0) {
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
          Spending by Category
        </h3>
        <p
          className="text-sm text-center py-12"
          style={{ color: 'var(--text-tertiary)' }}
        >
          No expense data for this month
        </p>
      </div>
    );
  }

  const data = categoryBreakdown.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
    fill: CATEGORY_COLORS[item.category] || '#94a3b8',
  }));

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
        Spending by Category
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
