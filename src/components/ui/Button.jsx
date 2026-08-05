import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-[0_2px_8px_rgba(20,130,86,0.28)] hover:shadow-[0_4px_14px_rgba(20,130,86,0.36)]',
  secondary: '',
  danger: 'bg-danger-500 hover:bg-danger-600 text-white shadow-[0_2px_8px_rgba(193,90,58,0.28)]',
  success: 'bg-success-600 hover:bg-success-700 text-white shadow-[0_2px_8px_rgba(79,138,63,0.28)]',
  ghost: '',
  outline: '',
};

const sizes = {
  sm: 'px-4 py-2 text-[13px]',
  md: 'px-5 py-2.5 text-[14px]',
  lg: 'px-7 py-3.5 text-[15px]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const ghostStyle =
    variant === 'ghost'
      ? {
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
        }
      : {};

  const secondaryStyle =
    variant === 'secondary'
      ? {
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
        }
      : {};

  const outlineStyle =
    variant === 'outline'
      ? {
          background: 'transparent',
          color: 'var(--text-primary)',
          border: '1.5px solid var(--border-color)',
        }
      : {};

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-all duration-150 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      style={{ ...ghostStyle, ...secondaryStyle, ...outlineStyle }}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
}
