import { Loader2 } from 'lucide-react';

export default function Loader({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: 20, md: 32, lg: 48 };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2
        size={sizes[size]}
        className="animate-spin"
        style={{ color: 'var(--color-primary-500)' }}
      />
      {text && (
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {text}
        </p>
      )}
    </div>
  );
}
