import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { LoadingState, Notice } from '../../components/ui/Feedback';

const STATUS_LABEL = {
  pending: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', color: 'bg-brand-light text-brand-dark' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === '1';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMarkingReceived, setIsMarkingReceived] = useState(false);
  const [confirmReceived, setConfirmReceived] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkAsReceived = async () => {
    setIsMarkingReceived(true);
    try {
      await api.put(`/orders/${id}/received`);
      setOrder({ ...order, status: 'delivered' });
      setConfirmReceived(false);
      setMessage({ type: 'success', text: 'Order marked as received.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to update this order.' });
    } finally {
      setIsMarkingReceived(false);
    }
  };

  if (loading) return <LoadingState label="Loading order..." />;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>;

  const s = STATUS_LABEL[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
  const total = order.items.reduce((sum, i) => sum + i.quantity * parseFloat(i.unit_price), 0);

  return (
    <div className="max-w-2xl mx-auto">
      {isSuccess && (
        <div className="app-card-soft p-8 mb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-700 font-bold text-2xl mb-1">Payment successful</p>
          <p className="text-green-600 text-sm">Thank you for your order. We will ship your items as soon as possible.</p>
        </div>
      )}
      {message && (
        <div className="mb-4">
          <Notice type={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Notice>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
      </div>

      <div className="space-y-4">
        {/* Items */}
        <div className="app-card p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Order Items</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                  <p className="text-xs text-gray-400">{item.quantity} × THB {Number(item.unit_price).toLocaleString()}</p>
                </div>
                <p className="text-sm font-medium">THB {(item.quantity * parseFloat(item.unit_price)).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-brand">THB {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="app-card p-5">
          <h2 className="font-semibold text-gray-700 mb-2">Shipping Address</h2>
          <p className="text-sm text-gray-700">{order.recipient_name} · {order.shipping_phone}</p>
          <p className="text-sm text-gray-500">{order.street} {order.sub_district} {order.district} {order.province} {order.postal_code}</p>
        </div>

        {/* Payment */}
        {order.payment && (
          <div className="app-card p-5">
            <h2 className="font-semibold text-gray-700 mb-2">Payment</h2>
            <p className="text-sm text-gray-600">Method: {order.payment.method} · Status: <span className="text-green-600 font-medium">{order.payment.status}</span></p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {order.status === 'shipped' && (
          confirmReceived ? (
            <div className="app-card-soft flex flex-1 items-center gap-3 p-3">
              <span className="flex-1 text-sm font-semibold text-ink">Confirm that you received this order?</span>
              <button
                onClick={handleMarkAsReceived}
                disabled={isMarkingReceived}
                className="app-button px-4 py-2 text-sm disabled:opacity-60"
              >
                {isMarkingReceived ? 'Updating...' : 'Confirm'}
              </button>
              <button onClick={() => setConfirmReceived(false)} className="app-button-secondary px-4 py-2 text-sm">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReceived(true)}
              disabled={isMarkingReceived}
              className="app-button flex-1 py-3 disabled:opacity-60"
            >
              Mark as Received
            </button>
          )
        )}
        <Link to="/orders" className="text-sm text-gray-500 hover:text-gray-700">← Order History</Link>
        <Link to="/products" className="text-sm font-bold text-brand hover:underline">Continue Shopping</Link>
      </div>
    </div>
  );
}
