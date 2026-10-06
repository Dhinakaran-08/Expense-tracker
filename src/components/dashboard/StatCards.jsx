import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { CURRENCY } from '../../lib/constants';

const stats = [
  {
    key: 'balance',
    label: 'Wallet Balance',
    subLabel: 'Total in wallet',
    mainValueKey: 'totalBalance',
    badge: (totals) => {
      const mb = totals?.monthBalance ?? 0;
      const isPositive = mb >= 0;
      return {
        text: `${isPositive ? '+' : '−'}${CURRENCY}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.abs(mb))} this month`,
        color: isPositive ? 'var(--color-success-600)' : 'var(--color-danger-600)',
      };
    },
    icon: Wallet,
    color: 'var(--color-accent-indigo)',
    bg: 'var(--color-accent-indigo-bg)',
  },
  {
    key: 'income',
    label: 'Monthly Income',
    subLabel: 'Income this month',
    mainValueKey: 'monthIncome',
    allTimeKey: 'totalIncome',
    fallbackKey: 'income',
    icon: TrendingUp,
    color: 'var(--color-success-600)',
    bg: 'var(--color-success-50)',
  },
  {
    key: 'expense',
    label: 'Monthly Expenses',
    subLabel: 'Expenses this month',
    mainValueKey: 'monthExpense',
    allTimeKey: 'totalExpense',
    fallbackKey: 'expense',
    icon: TrendingDown,
    color: 'var(--color-danger-600)',
    bg: 'var(--color-danger-50)',
  },
];

export default function StatCards({ totals = {} }) {
  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.abs(amount || 0));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const mainAmount = totals[stat.mainValueKey] ?? totals[stat.key] ?? 0;
        const allTimeAmount = stat.allTimeKey ? (totals[stat.allTimeKey] ?? totals[stat.fallbackKey] ?? 0) : null;
        const badgeInfo = stat.badge ? stat.badge(totals) : null;

        return (
          <div
            key={stat.key}
            className="p-5 rounded-xl transition-all duration-200"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                {stat.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: stat.bg }}
              >
                <stat.icon size={16} style={{ color: stat.color }} strokeWidth={2.25} />
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                {CURRENCY}
              </span>
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatAmount(mainAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
              {badgeInfo ? (
                <>
                  <span style={{ color: 'var(--text-secondary)' }}>Net this month</span>
                  <span className="font-semibold" style={{ color: badgeInfo.color }}>
                    {badgeInfo.text}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ color: 'var(--text-secondary)' }}>All-time total</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {CURRENCY}{formatAmount(allTimeAmount)}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
