import { format, parseISO } from 'date-fns';
import {
  Banknote, Wallet, UtensilsCrossed, ShoppingBasket, Home,
  ShoppingBag, Receipt, Gamepad2, HeartPulse, Plane, MoreHorizontal,
  HandCoins,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { CURRENCY, CATEGORY_COLORS } from '../../lib/constants';

const iconMap = {
  'Monthly Salary': Banknote,
  'Pocket Money': Wallet,
  'Receive Lend': HandCoins,
  Food: UtensilsCrossed,
  Grocery: ShoppingBasket,
  Rent: Home,
  Lend: HandCoins,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Gamepad2,
  Medical: HeartPulse,
  Travel: Plane,
  Others: MoreHorizontal,
};

export default function RecentTransactions({ transactions = [] }) {
  const recent = transactions.slice(0, 5);

  if (recent.length === 0) {
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
          Recent Transactions
        </h3>
        <p
          className="text-sm text-center py-8"
          style={{ color: 'var(--text-tertiary)' }}
        >
          No transactions yet. Add your first one!
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
        className="text-base font-semibold mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        Recent Transactions
      </h3>
      <div>
        {recent.map((t, i) => {
          const Icon = iconMap[t.category] || MoreHorizontal;
          const isIncome = t.type === 'income';
          const color = CATEGORY_COLORS[t.category] || 'var(--text-tertiary)';
          return (
            <div
              key={t.id}
              className="flex items-center gap-3.5 py-4"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}1c` }}
              >
                <Icon size={16} strokeWidth={2} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.description || t.category}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {t.category} · {format(parseISO(t.date), 'dd MMM yyyy')}
                </p>
              </div>
              <span
                className="text-sm font-semibold figure"
                style={{
                  color: isIncome ? 'var(--color-success-600)' : 'var(--color-danger-600)',
                }}
              >
                {isIncome ? '+' : '−'}{CURRENCY}
                {new Intl.NumberFormat('en-IN').format(t.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
