import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { EmptyState, LoadingState, Notice } from '../../components/ui/Feedback';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABEL = {
  pending: 'Pending Payment', processing: 'Processing',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};
const getStatusFromParams = (searchParams) => {
  const value = searchParams.get('status');
  return STATUSES.includes(value) ? value : '';
};

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(() => getStatusFromParams(searchParams));
  const [message, setMessage] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/admin/orders', { params: filter ? { status: filter } : {} })
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  useEffect(() => {
    setFilter(getStatusFromParams(searchParams));
  }, [searchParams]);

  const updateFilter = (nextFilter) => {
    setFilter(nextFilter);
    const nextParams = new URLSearchParams(searchParams);
    if (nextFilter) {
      nextParams.set('status', nextFilter);
    } else {
      nextParams.delete('status');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      setMessage({ type: 'success', text: `Order #${id} status updated.` });
      fetchOrders();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to update order status.' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h1>
      {message && (
        <div className="mb-4">
          <Notice type={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Notice>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => updateFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => updateFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? <LoadingState label="Loading orders..." /> : (
        <div className="app-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['#', 'Customer', 'Date', 'Total', 'Status', 'Update'].map(h => (
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
                  <td className="px-4 py-3 font-medium text-brand">THB {Number(order.total_price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{STATUS_LABEL[order.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className="app-input px-2 py-1 text-xs"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-4">
              <EmptyState title="No orders found" message="Try switching status filters or wait for customer orders." />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
