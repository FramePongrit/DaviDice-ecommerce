import { useState, useEffect } from 'react';
import api from '../../api/axios';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABEL = {
  pending: 'รอชำระเงิน', processing: 'เตรียมสินค้า',
  shipped: 'จัดส่งแล้ว', delivered: 'สำเร็จ', cancelled: 'ยกเลิก',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    api.get('/admin/orders', { params: filter ? { status: filter } : {} })
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id, status) => {
    await api.put(`/admin/orders/${id}/status`, { status });
    fetchOrders();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">จัดการออเดอร์</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>ทั้งหมด</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-10 text-gray-400">กำลังโหลด...</div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['#', 'ลูกค้า', 'วันที่', 'ยอดรวม', 'สถานะ', 'อัปเดต'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-700">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('th-TH')}</td>
                  <td className="px-4 py-3 font-medium text-indigo-600">฿{Number(order.total_price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{STATUS_LABEL[order.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="text-center py-10 text-gray-400">ไม่มีออเดอร์</div>}
        </div>
      )}
    </div>
  );
}
