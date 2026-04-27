import { useState, useEffect } from 'react';
import api from '../../api/axios';

const emptyForm = { name: '', description: '', price: '', stock_qty: '', category_id: '', image_url: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    api.get('/products', { params: { limit: 100 } })
      .then(r => setProducts(r.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get('/products/categories').then(r => setCategories(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/products/${editing}`, form);
      } else {
        await api.post('/products', form);
      }
      setForm(emptyForm);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name, description: product.description || '',
      price: product.price, stock_qty: product.stock_qty,
      category_id: product.category_id, image_url: product.image_url || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('ยืนยันลบสินค้านี้?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'ไม่สามารถลบสินค้าได้');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">จัดการสินค้า</h1>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">{editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          {[
            { label: 'ชื่อสินค้า', key: 'name', colSpan: 2 },
            { label: 'ราคา (บาท)', key: 'price', type: 'number' },
            { label: 'จำนวนสต็อก', key: 'stock_qty', type: 'number' },
            { label: 'URL รูปภาพ', key: 'image_url', colSpan: 2 },
            { label: 'คำอธิบาย', key: 'description', colSpan: 2 },
          ].map(({ label, key, type = 'text', colSpan }) => (
            <div key={key} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required={key !== 'image_url' && key !== 'description'}
                min={type === 'number' ? 0 : undefined}
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">หมวดหมู่</label>
            <select
              value={form.category_id}
              onChange={e => setForm({ ...form, category_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-2 mt-1">
            <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="text-sm text-gray-400 px-4 py-2">
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Product list */}
      {loading ? <div className="text-center py-10 text-gray-400">กำลังโหลด...</div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['สินค้า', 'หมวดหมู่', 'ราคา', 'สต็อก', 'จัดการ'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-8 h-8 object-cover rounded" />
                      ) : <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs">📦</div>}
                      <span className="font-medium text-gray-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category_name}</td>
                  <td className="px-4 py-3 text-indigo-600 font-medium">฿{Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock_qty < 5 ? 'text-red-500 font-medium' : 'text-gray-600'}>{p.stock_qty}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="text-indigo-600 hover:underline text-xs">แก้ไข</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <div className="text-center py-10 text-gray-400">ยังไม่มีสินค้า</div>}
        </div>
      )}
    </div>
  );
}
