import { Calendar, DollarSign, TrendingDown, Percent } from 'lucide-react';
import { CURRENCY } from '../../lib/constants';

export default function AnalyticsSummary({ summary }) {
  const cards = [
    {
      label: 'Avg Daily Spend',
      value: `${CURRENCY}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(summary.avgDailySpend || 0)}`,
      sub: 'Per day this month',
      icon: Calendar,
      color: 'var(--color-primary-600)',
      bg: 'var(--color-primary-50)',
    },
    {
      label: 'Highest Category',
      value: summary.highestCategory || 'N/A',
      sub: summary.highestCategoryAmount > 0
        ? `${CURRENCY}${new Intl.NumberFormat('en-IN').format(summary.highestCategoryAmount)}`
        : 'No data',
      icon: TrendingDown,
      color: 'var(--color-danger-500)',
      bg: 'var(--color-danger-50)',
    },
    {
      label: 'Savings Rate',
      value: `${summary.savingsRate || 0}%`,
      sub: 'Of total monthly income',
      icon: Percent,
      color: 'var(--color-success-500)',
      bg: 'var(--color-success-50)',
    },
    {
      label: 'Projected Expense',
      value: `${CURRENCY}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(summary.projectedMonthlyExpense || 0)}`,
      sub: 'By month end at current pace',
      icon: DollarSign,
      color: 'var(--color-accent-amber)',
      bg: 'var(--color-accent-amber-bg)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="p-5 rounded-lg"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {c.label}
            </span>
            <div className="p-2 rounded-md" style={{ background: c.bg }}>
              <c.icon size={18} style={{ color: c.color }} />
            </div>
          </div>
          <p
            className="text-2xl font-bold truncate mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {c.value}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {c.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
