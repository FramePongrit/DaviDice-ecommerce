import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dice5, Eye, EyeOff } from 'lucide-react';
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

const fieldClass = 'h-12 w-full rounded-xl border border-black px-4 text-lg text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(''), 8000);
    return () => clearTimeout(timer);
  }, [error]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Create account failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center">
      <AuthLogo />
      <h1 className="mt-3 text-2xl font-black text-ink">Create account</h1>

      <section className="mt-5 w-full max-w-4xl rounded-3xl bg-white px-6 py-6 shadow-[0_18px_54px_rgba(17,24,39,0.04)] sm:px-8 lg:px-10">
        {error && (
          <div className="mb-4 rounded-xl border border-crypto-red/30 bg-crypto-red/10 px-4 py-2 text-sm font-semibold text-crypto-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-lg font-black text-ink">Username</label>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className={fieldClass}
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-lg font-black text-ink">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className={fieldClass}
                placeholder="Enter Email"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-lg font-black text-ink">Password (minimum 6 letters)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  className={`${fieldClass} pr-16`}
                  placeholder="Enter password"
                  minLength={6}
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

            <div>
              <label className="mb-2 block text-lg font-black text-ink">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(event) => updateField('confirmPassword', event.target.value)}
                  className={`${fieldClass} pr-16`}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate transition hover:bg-brand-light hover:text-brand"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-lg font-black text-ink">Phone number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                className={fieldClass}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="mt-7 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full max-w-[420px] rounded-xl bg-brand-gold text-lg font-black text-ink transition hover:bg-brand hover:text-white disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-lg text-steel">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-gold hover:text-brand">
            Login Now
          </Link>
        </p>
      </section>
    </div>
  );
}
