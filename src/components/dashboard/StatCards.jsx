import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { CURRENCY } from '../../lib/constants';

const stats = [
  {
    key: 'balance',
    label: 'Current balance',
    icon: Wallet,
    color: 'var(--color-accent-indigo)',
    bg: 'var(--color-accent-indigo-bg)',
  },
  {
    key: 'income',
    label: 'Total income',
    icon: TrendingUp,
    color: 'var(--color-success-600)',
    bg: 'var(--color-success-50)',
  },
  {
    key: 'expense',
    label: 'Total expenses',
    icon: TrendingDown,
    color: 'var(--color-danger-600)',
    bg: 'var(--color-danger-50)',
  },
  {
    key: 'savings',
    label: 'Total savings',
    icon: PiggyBank,
    color: 'var(--color-accent-amber)',
    bg: 'var(--color-accent-amber-bg)',
  },
];

export default function StatCards({ totals }) {
  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.abs(amount));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="p-6"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12.5px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {stat.label}
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: stat.bg }}
            >
              <stat.icon size={15} style={{ color: stat.color }} strokeWidth={2.25} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {CURRENCY}
            </span>
            <span
              className="text-[26px] font-serif font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {formatAmount(totals[stat.key] || 0)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
