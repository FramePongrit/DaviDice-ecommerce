import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="flex w-full max-w-2xl rounded-[12px] border border-ui-border shadow-[rgba(32,32,37,0.05)_0px_3px_5px_0px] overflow-hidden">

        {/* Left dark panel */}
        <div className="hidden md:flex flex-col justify-between p-10 w-2/5" style={{ backgroundColor: '#222126' }}>
          <div>
            <p className="text-2xl font-bold text-white">
              Davi<span style={{ color: '#F0B90B' }}>Dice</span>
            </p>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: '#848E9C' }}>
              เริ่มต้นประสบการณ์การช้อปปิ้งลูกเต๋าของคุณ
            </p>
          </div>
          <div className="space-y-3">
            {['สมัครฟรีไม่มีค่าใช้จ่าย', 'ติดตามออเดอร์แบบ real-time', 'รับโปรโมชั่นพิเศษ'].map(text => (
              <div key={text} className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: '#F0B90B' }}>✓</span>
                <span className="text-xs" style={{ color: '#848E9C' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 bg-white p-8">
          <h1 className="text-2xl font-bold text-ink mb-1">สมัครสมาชิก</h1>
          <p className="text-sm text-slate mb-6">สร้างบัญชีใหม่</p>

          {error && (
            <div className="border border-crypto-red/30 bg-crypto-red/10 text-crypto-red text-sm px-4 py-2 rounded-[8px] mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'ชื่อ', key: 'name', type: 'text', placeholder: 'ชื่อของคุณ' },
              { label: 'อีเมล', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'รหัสผ่าน (อย่างน้อย 6 ตัว)', key: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'เบอร์โทรศัพท์ (ไม่บังคับ)', key: 'phone', type: 'tel', placeholder: '08x-xxx-xxxx' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-copy mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-ui-border rounded-[8px] px-3 py-2.5 text-sm text-ink placeholder-slate bg-white focus:outline-none focus:border-black transition-colors duration-200"
                  required={key !== 'phone'}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-ink py-2.5 rounded-[6px] font-semibold text-sm hover:bg-brand-hover hover:text-white disabled:opacity-50 transition-colors duration-200 mt-2"
            >
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p className="text-sm text-slate text-center mt-5">
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className="text-brand font-semibold hover:text-brand-dark transition-colors duration-200">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
