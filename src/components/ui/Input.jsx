import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-md px-3.5 py-2.5 text-sm outline-none
            transition-colors duration-150
            focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            ${Icon ? 'pl-10' : ''}
          `}
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: error
              ? '1px solid var(--color-danger-500)'
              : '1px solid var(--border-color)',
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'var(--color-danger-500)' }}>
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
