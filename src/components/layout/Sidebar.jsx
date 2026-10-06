import { Link, NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { signOut, profile } = useAuth();
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="app-sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`app-sidebar flex flex-col ${isOpen ? 'is-open' : ''}`}
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)' }}
      >
        {/* Brand */}
        <div
          className="flex items-center justify-between px-5"
          style={{ height: '64px', borderBottom: '1px solid var(--border-color)' }}
        >
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-85 cursor-pointer"
            title="Go to Dashboard"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-primary-600)' }}
            >
              <LayoutDashboard size={14} color="#ffffff" strokeWidth={2.25} />
            </div>
            <span
              className="text-[16px] font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              ExpenseIQ
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md app-mobile-only"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav — fills remaining space so footer sits at the bottom */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 h-10 px-3 rounded-md text-[13.5px] font-medium transition-colors duration-150"
                style={{
                  color: isActive ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--color-primary-50)' : 'transparent',
                }}
              >
                <item.icon size={17} strokeWidth={2} className="shrink-0" />
                <span className="leading-none">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2.5 h-11 px-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-[11px] shrink-0 overflow-hidden"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full" style={{ objectFit: 'cover' }} />
              ) : (
                profile?.full_name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <span
              className="text-[13px] truncate flex-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              {profile?.full_name || 'Account'}
            </span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 h-10 px-3 rounded-md text-[13.5px] font-medium w-full transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut size={17} className="shrink-0" />
            <span className="leading-none">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
