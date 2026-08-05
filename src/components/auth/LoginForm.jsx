import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword } from '../../lib/validation';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function LoginForm() {
  const { signIn, enableDemoMode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = {
      email: validateEmail(email),
      password: password ? '' : 'Password is required',
    };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestClick = () => {
    enableDemoMode();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
            style={{ background: 'var(--color-primary-600)' }}
          >
            <Wallet size={19} color="#ffffff" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Sign in to ExpenseIQ
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Track your income and expenses in one place.
          </p>
        </div>

        <div
          className="p-6"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}
        >
          {error && (
            <div
              className="mb-4 px-3 py-2.5 rounded-md text-[13px]"
              style={{ color: 'var(--color-danger-600)', background: 'var(--color-danger-50)', border: '1px solid var(--color-danger-100)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
              }}
              autoComplete="email"
              error={fieldErrors.email}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                }}
                autoComplete="current-password"
                error={fieldErrors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] p-1"
                style={{ color: 'var(--text-tertiary)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full justify-center mt-1">
              Sign in
            </Button>
          </form>

          <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={handleGuestClick}
              className="w-full py-2 text-[13px] font-medium transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Continue without an account
            </button>
          </div>
        </div>

        <p className="text-[13px] text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium" style={{ color: 'var(--color-primary-600)' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
