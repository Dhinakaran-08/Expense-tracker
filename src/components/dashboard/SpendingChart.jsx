import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths, format, parseISO, isWithinInterval } from 'date-fns';
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

export default function SpendingChart({ transactions = [], categoryBreakdown: defaultBreakdown = [] }) {
  const [monthOffset, setMonthOffset] = useState(0);

  const selectedDate = useMemo(() => subMonths(new Date(), monthOffset), [monthOffset]);
  const monthLabel = format(selectedDate, 'MMMM yyyy');

  const breakdown = useMemo(() => {
    if (monthOffset === 0 && transactions.length === 0 && defaultBreakdown.length > 0) {
      return defaultBreakdown;
    }
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);

    const monthExpenses = transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const cat = t.category?.toLowerCase();
      if (cat === 'lend' || cat === 'receive lend') return false;
      const d = parseISO(t.date);
      return isWithinInterval(d, { start, end });
    });

    const totalExpense = monthExpenses.reduce((s, t) => s + Number(t.amount), 0);

    const categoryMap = {};
    monthExpenses.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
    });

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, selectedDate, monthOffset, defaultBreakdown]);

  const data = breakdown.map((item) => ({
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Spending by Category
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {monthLabel}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMonthOffset((prev) => prev + 1)}
            className="p-1.5 rounded-lg border transition-all duration-150 flex items-center justify-center"
            style={{
              background: 'var(--bg-tertiary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
            title="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="text-xs font-semibold px-2 py-1 rounded-md"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            {monthOffset === 0 ? 'Current' : `-${monthOffset}m`}
          </span>
          <button
            onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
            disabled={monthOffset === 0}
            className="p-1.5 rounded-lg border transition-all duration-150 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'var(--bg-tertiary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
            title="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {breakdown.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            No expense data for {monthLabel}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Navigate months using the arrows above
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
