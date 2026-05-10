import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_LABEL = {
  pending: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', color: 'bg-brand-light text-brand-dark' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Order History</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No orders yet</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const s = STATUS_LABEL[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
            return (
              <Link key={order.id} to={`/orders/${order.id}`} className="app-card block p-5 transition hover:-translate-y-0.5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">Order #{order.id}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                    <p className="text-brand font-bold mt-1">THB {Number(order.total_price).toLocaleString()}</p>
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
