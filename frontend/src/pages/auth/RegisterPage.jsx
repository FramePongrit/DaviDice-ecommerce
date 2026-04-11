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
    <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">สมัครสมาชิก</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: 'ชื่อ', key: 'name', type: 'text' },
          { label: 'อีเมล', key: 'email', type: 'email' },
          { label: 'รหัสผ่าน (อย่างน้อย 6 ตัว)', key: 'password', type: 'password' },
          { label: 'เบอร์โทรศัพท์ (ไม่บังคับ)', key: 'phone', type: 'tel' },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={key !== 'phone'}
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
      </form>
      <p className="text-sm text-gray-500 text-center mt-4">
        มีบัญชีแล้ว?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}
