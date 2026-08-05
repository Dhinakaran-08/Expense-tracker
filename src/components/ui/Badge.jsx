import { CATEGORY_COLORS } from '../../lib/constants';

export default function Badge({ children, category, variant = 'default', className = '' }) {
  const color = category ? CATEGORY_COLORS[category] : null;

  const variantStyles = {
    default: {
      background: color ? `${color}18` : 'var(--bg-tertiary)',
      color: color || 'var(--text-secondary)',
      border: `1px solid ${color ? `${color}30` : 'var(--border-color)'}`,
    },
    income: {
      background: 'var(--color-success-50)',
      color: 'var(--color-success-600)',
      border: '1px solid var(--color-success-100)',
    },
    expense: {
      background: 'var(--color-danger-50)',
      color: 'var(--color-danger-600)',
      border: '1px solid var(--color-danger-100)',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
