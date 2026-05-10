import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dice5, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function AuthLogo() {
  return (
    <Link to="/" className="flex items-center justify-center gap-3 sm:gap-4">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-2xl font-black text-white shadow-[0_18px_36px_rgba(36,136,59,0.18)] sm:h-14 sm:w-14 sm:text-3xl">
        <Dice5 size={30} strokeWidth={2.8} />
      </span>
      <span className="text-3xl font-black tracking-tight text-brand sm:text-5xl">
        Davi<span className="text-brand-gold">Dice</span>
      </span>
    </Link>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/products');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center">
      <AuthLogo />

      <section className="mt-8 w-full max-w-[440px] rounded-3xl bg-white p-5 shadow-[0_18px_54px_rgba(17,24,39,0.04)] sm:p-6">
        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-crypto-red/30 bg-crypto-red/10 px-4 py-3 text-sm font-semibold text-crypto-red">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-crypto-red/70 transition hover:text-crypto-red"
              aria-label="Dismiss login error"
            >
              <X size={16} strokeWidth={2.8} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-lg font-black text-ink">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="h-12 w-full rounded-xl border border-black px-4 text-lg text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              placeholder="Enter Email"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-lg font-black text-ink">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                className="h-12 w-full rounded-xl border border-black px-4 pr-16 text-lg text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate transition hover:bg-brand-light hover:text-brand"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-brand-gold text-lg font-black text-ink transition hover:bg-brand hover:text-white disabled:opacity-60"
          >
            {loading ? 'Login...' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-lg text-steel">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-gold hover:text-brand">
            Register Now
          </Link>
        </p>
      </section>
    </div>
  );
}
