import { CURRENCY, CATEGORY_COLORS } from '../../lib/constants';

export default function BudgetProgress({ budget, spent = 0 }) {
  const percentage = budget.limit_amount > 0
    ? Math.min((spent / budget.limit_amount) * 100, 100)
    : 0;
  const remaining = budget.limit_amount - spent;
  const isOver = spent > budget.limit_amount;
  const isWarning = percentage >= 80 && !isOver;

  const color = CATEGORY_COLORS[budget.category] || 'var(--color-primary-500)';
  const barColor = isOver ? 'var(--color-danger-500)' : isWarning ? '#f59e0b' : color;

  return (
    <div
      className="p-4 rounded-xl transition-all duration-200"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {budget.category}
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: isOver
              ? 'var(--color-danger-50)'
              : isWarning
                ? 'rgba(245, 158, 11, 0.1)'
                : 'var(--color-success-50)',
            color: isOver ? 'var(--color-danger-500)' : isWarning ? '#f59e0b' : 'var(--color-success-500)',
          }}
        >
          {isOver ? 'Over Budget!' : isWarning ? 'Almost there' : 'On track'}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden mb-2"
        style={{ background: `${barColor}20` }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            background: barColor,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span
          className="text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {CURRENCY}{new Intl.NumberFormat('en-IN').format(spent)} spent
        </span>
        <span
          className="text-xs font-medium"
          style={{
            color: isOver ? 'var(--color-danger-500)' : 'var(--text-secondary)',
          }}
        >
          {isOver ? '-' : ''}{CURRENCY}
          {new Intl.NumberFormat('en-IN').format(Math.abs(remaining))}{' '}
          {isOver ? 'over' : 'left'}
        </span>
      </div>
      <div className="text-right mt-1">
        <span
          className="text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          of {CURRENCY}{new Intl.NumberFormat('en-IN').format(budget.limit_amount)}
        </span>
      </div>
    </div>
  );
}
