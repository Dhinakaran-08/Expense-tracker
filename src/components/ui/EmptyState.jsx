import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No data yet',
  description = 'Get started by adding your first entry.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div
        className="p-4 rounded-lg mb-4"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <Icon size={40} style={{ color: 'var(--text-tertiary)' }} />
      </div>
      <h3
        className="text-lg font-semibold mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      <p
        className="text-sm mb-6 max-w-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {description}
      </p>
      {action}
    </div>
  );
}
