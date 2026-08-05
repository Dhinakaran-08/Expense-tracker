import { CATEGORY_COLORS, CURRENCY } from '../../lib/constants';

export default function CategoryBreakdown({ categoryBreakdown = [] }) {
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
          Category Breakdown
        </h3>
        <p
          className="text-sm text-center py-8"
          style={{ color: 'var(--text-tertiary)' }}
        >
          No expenses recorded this month.
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
        Expense Category Breakdown
      </h3>
      <div className="space-y-4">
        {categoryBreakdown.map((item) => {
          const color = CATEGORY_COLORS[item.category] || '#94a3b8';
          return (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {CURRENCY}{new Intl.NumberFormat('en-IN').format(item.amount)}
                  </span>
                  <span
                    className="text-xs w-12 text-right"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    background: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
