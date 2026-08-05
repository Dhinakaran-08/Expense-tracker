import { Edit3, Trash2 } from 'lucide-react';
import BudgetProgress from './BudgetProgress';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { PiggyBank } from 'lucide-react';

export default function BudgetList({
  budgets = [],
  spending = {},
  onEdit,
  onDelete,
  onAdd,
}) {
  if (budgets.length === 0) {
    return (
      <EmptyState
        icon={PiggyBank}
        title="No budgets set"
        description="Set monthly spending limits to keep your finances on track."
        action={
          <Button onClick={onAdd} size="md">
            Set Your First Budget
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {budgets.map((budget) => (
        <div
          key={budget.id}
          className="rounded-lg overflow-hidden animate-fade-in"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="p-4">
            <BudgetProgress
              budget={budget}
              spent={spending[budget.category] || 0}
            />
          </div>
          <div
            className="flex items-center justify-end gap-1 px-4 pb-3"
          >
            <button
              onClick={() => onEdit(budget)}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-primary-500)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => onDelete(budget.id)}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-danger-500)';
                e.currentTarget.style.background = 'var(--color-danger-50)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
