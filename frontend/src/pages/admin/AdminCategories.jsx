import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    api.get('/admin/categories').then(r => setCategories(r.data));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/categories', form);
      setForm({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`ยืนยันลบหมวดหมู่ "${name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ อาจมีสินค้าอยู่ในหมวดหมู่นี้');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">จัดการหมวดหมู่</h1>

      {/* Add form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">เพิ่มหมวดหมู่ใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">ชื่อหมวดหมู่</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="เช่น บอร์ดเกม, ลูกเต๋า"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">คำอธิบาย (ไม่บังคับ)</label>
            <input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="คำอธิบายสั้น ๆ"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'กำลังบันทึก...' : 'เพิ่มหมวดหมู่'}
          </button>
        </form>
      </div>

      {/* Category list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">#</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">ชื่อ</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">คำอธิบาย</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{c.id}</td>
                <td className="px-4 py-3 font-medium text-gray-700">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.description || '-'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-10 text-gray-400">ยังไม่มีหมวดหมู่</div>
        )}
      </div>
    </div>
  );
}
