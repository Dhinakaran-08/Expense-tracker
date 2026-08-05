import { Menu, Sun, Moon, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';

export default function TopBar({ onMenuClick, title, onQuickAdd }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-16"
      style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md app-mobile-only"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Menu size={20} />
        </button>
        <h2
          className="text-[13px] font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {onQuickAdd && (
          <Button size="sm" icon={Plus} onClick={onQuickAdd}>
            Add entry
          </Button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </div>
    </header>
  );
}
