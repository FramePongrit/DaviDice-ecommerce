import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { Notice } from '../../components/ui/Feedback';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddr, setNewAddr] = useState({ recipient_name: '', phone: '', street: '', sub_district: '', district: '', province: '', postal_code: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then(() => {});
    api.get('/addresses').then(r => {
      setAddresses(r.data);
      const def = r.data.find(a => a.is_default);
      if (def) setSelectedAddress(String(def.id));
    }).catch(() => {});
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddr);
      setAddresses(prev => [...prev, res.data.address]);
      setSelectedAddress(String(res.data.address.id));
      setShowForm(false);
      setMessage({ type: 'success', text: 'Address saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to save address.' });
    }
  };

  const handleOrder = async () => {
    if (!selectedAddress) {
      setMessage({ type: 'warning', text: 'Please choose a shipping address before checkout.' });
      return;
    }
    setLoading(true);
    try {
      const orderRes = await api.post('/orders', { shipping_address_id: parseInt(selectedAddress) });
      const orderId = orderRes.data.order_id;
      await api.post('/payments', { order_id: orderId, method: 'mock' });
      navigate(`/orders/${orderId}?success=1`);
      fetchCart();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to place order.' });
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Confirm Order</h1>
      {message && (
        <div className="mb-4">
          <Notice type={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Notice>
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-4">
          {/* Address */}
          <div className="app-card p-5">
            <h2 className="font-semibold text-gray-700 mb-3">Shipping Address</h2>
            {addresses.length === 0 && !showForm && (
              <p className="text-sm text-gray-400 mb-3">No address yet. Please add a shipping address first.</p>
            )}
            <div className="space-y-2 mb-3">
              {addresses.map(addr => (
                <label key={addr.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddress === String(addr.id)}
                    onChange={e => setSelectedAddress(e.target.value)}
                    className="mt-1"
                  />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{addr.recipient_name} · {addr.phone}</p>
                    <p className="text-gray-500">{addr.street} {addr.sub_district} {addr.district} {addr.province} {addr.postal_code}</p>
                  </div>
                </label>
              ))}
            </div>
            <button onClick={() => setShowForm(!showForm)} className="text-sm font-bold text-brand hover:underline">
              + Add new address
            </button>
            {showForm && (
              <form onSubmit={handleSaveAddress} className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { label: 'Recipient Name', key: 'recipient_name' }, { label: 'Phone', key: 'phone' },
                  { label: 'Street Address', key: 'street' }, { label: 'Sub-district', key: 'sub_district' },
                  { label: 'District', key: 'district' }, { label: 'Province', key: 'province' },
                  { label: 'Postal Code', key: 'postal_code' },
                ].map(({ label, key }) => (
                  <div key={key} className={key === 'street' ? 'col-span-2' : ''}>
                    <label className="text-xs text-gray-500">{label}</label>
                    <input
                      value={newAddr[key]}
                      onChange={e => setNewAddr({ ...newAddr, [key]: e.target.value })}
                      className="app-input w-full px-2 py-1.5 text-sm mt-0.5"
                      required
                    />
                  </div>
                ))}
                <div className="col-span-2 flex gap-2 mt-1">
                  <button type="submit" className="app-button px-4 py-1.5 text-sm">Save</button>
                  <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400">Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Payment method */}
          <div className="app-card p-5">
            <h2 className="font-semibold text-gray-700 mb-2">Payment</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input type="radio" checked readOnly /> <span>Mock Payment (Test)</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="md:col-span-2">
          <div className="app-card p-5 sticky top-24">
            <h2 className="font-semibold text-gray-700 mb-3">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1">{item.name} × {item.quantity}</span>
                  <span className="text-gray-700 ml-2">THB {Number(item.subtotal).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-brand">THB {Number(cart.total).toLocaleString()}</span>
            </div>
            <button
              onClick={handleOrder}
              disabled={loading}
              className="app-button w-full mt-4 py-3 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm and Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
