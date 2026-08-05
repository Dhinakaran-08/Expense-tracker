import { useState, useRef } from 'react';
import { User, Mail, Camera, Save, Check, Trash2, AlertTriangle, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../hooks/useTransactions';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function SectionCard({ title, icon: Icon, tone = 'default', children }) {
  const toneStyles = {
    default: { color: 'var(--color-accent-indigo)', bg: 'var(--color-accent-indigo-bg)', border: 'var(--border-color)' },
    amber: { color: 'var(--color-accent-amber)', bg: 'var(--color-accent-amber-bg)', border: 'var(--border-color)' },
    danger: { color: 'var(--color-danger-600)', bg: 'var(--color-danger-50)', border: 'var(--color-danger-100)' },
  };
  const t = toneStyles[tone] || toneStyles.default;
  return (
    <section
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${t.border}`,
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="flex items-center gap-2.5 px-6 py-4"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        {Icon && (
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: t.bg }}
          >
            <Icon size={14} style={{ color: t.color }} strokeWidth={2.25} />
          </div>
        )}
        <h2 className="text-[14px] font-semibold" style={{ color: tone === 'danger' ? t.color : 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { transactions, clearAllData } = useTransactions();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const fileInputRef = useRef(null);
  const [clearing, setClearing] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await updateProfile({ full_name: fullName, avatar_url: avatarUrl, bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose an image under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleClearData = async () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    setClearing(true);
    try {
      await clearAllData();
    } finally {
      setClearing(false);
      setConfirmingClear(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-8">
      <div>
        <h1
          className="text-[22px] font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Settings
        </h1>
        <p className="text-[13.5px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage your personal profile and application preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <SectionCard title="Personal profile" icon={User}>
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Full name"
            icon={User}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div>
            <label
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Profile picture
            </label>
            <div className="flex items-center gap-4 mt-1.5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full" style={{ objectFit: 'cover' }} />
                ) : (
                  <User size={24} style={{ color: 'var(--text-tertiary)' }} />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Camera}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? 'Change photo' : 'Upload photo'}
              </Button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-[13px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <Input
            label="Email address"
            icon={Mail}
            value={user?.email || ''}
            disabled
          />

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short line about yourself"
              rows={3}
              className="w-full rounded-md px-3.5 py-2.5 text-sm outline-none transition-colors duration-150 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              loading={loading}
              icon={saved ? Check : Save}
              variant={saved ? 'success' : 'primary'}
            >
              {saved ? 'Saved' : 'Save changes'}
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* Appearance Settings */}
      <SectionCard title="Appearance" icon={Palette} tone="amber">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[13.5px] font-medium" style={{ color: 'var(--text-primary)' }}>
              Theme
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Currently using <strong className="capitalize">{theme}</strong> mode
            </p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            Switch to {theme === 'light' ? 'dark' : 'light'}
          </Button>
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <SectionCard title="Danger zone" icon={AlertTriangle} tone="danger">
        <p className="text-[13px] mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {transactions.length > 0
            ? `You currently have ${transactions.length} transaction${transactions.length === 1 ? '' : 's'} stored. This permanently deletes every transaction on this account — including any old test or sample entries left over from earlier sessions. This cannot be undone.`
            : 'No transactions are stored right now. Use this if old test or sample entries ever reappear.'}
        </p>

        <div className="flex items-center gap-3">
          <Button
            variant="danger"
            icon={Trash2}
            loading={clearing}
            onClick={handleClearData}
          >
            {confirmingClear ? 'Click again to confirm' : 'Clear all transactions'}
          </Button>
          {confirmingClear && !clearing && (
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="text-[13px] font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
