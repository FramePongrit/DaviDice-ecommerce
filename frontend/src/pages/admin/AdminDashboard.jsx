import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_LABEL = {
  pending: { label: 'รอชำระ', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'เตรียมสินค้า', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'จัดส่งแล้ว', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'สำเร็จ', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-600' },
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'ออเดอร์ทั้งหมด', value: data.total_orders, icon: '📦' },
          { label: 'รายได้รวม', value: `฿${Number(data.total_revenue).toLocaleString()}`, icon: '💰' },
          { label: 'สินค้าทั้งหมด', value: data.total_products, icon: '🏷️' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
            <p className="text-3xl mb-1">{icon}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">ออเดอร์ล่าสุด</h2>
          <Link to="/admin/orders" className="text-sm text-indigo-600 hover:underline">ดูทั้งหมด →</Link>
        </div>
        <div className="space-y-2">
          {data.recent_orders.map(order => {
            const s = STATUS_LABEL[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
            return (
              <Link key={order.id} to={`/admin/orders`} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">#{order.id}</span>
                  <span className="text-sm text-gray-400 ml-2">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                  <span className="text-sm font-medium text-indigo-600">฿{Number(order.total_price).toLocaleString()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Link to="/admin/products" className="flex-1 bg-indigo-50 text-indigo-600 rounded-xl p-4 text-center font-medium hover:bg-indigo-100">
          จัดการสินค้า
        </Link>
        <Link to="/admin/orders" className="flex-1 bg-indigo-50 text-indigo-600 rounded-xl p-4 text-center font-medium hover:bg-indigo-100">
          จัดการออเดอร์
        </Link>
        <Link to="/admin/categories" className="flex-1 bg-indigo-50 text-indigo-600 rounded-xl p-4 text-center font-medium hover:bg-indigo-100">
          จัดการหมวดหมู่
        </Link>
      </div>
    </div>
  );
}
