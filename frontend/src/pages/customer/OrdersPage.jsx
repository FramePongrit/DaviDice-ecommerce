import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_LABEL = {
  pending: { label: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'กำลังเตรียมสินค้า', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'จัดส่งแล้ว', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'ได้รับสินค้าแล้ว', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-600' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ประวัติการสั่งซื้อ</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">ยังไม่มีออเดอร์</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const s = STATUS_LABEL[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
            return (
              <Link key={order.id} to={`/orders/${order.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">ออเดอร์ #{order.id}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                    <p className="text-indigo-600 font-bold mt-1">฿{Number(order.total_price).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
