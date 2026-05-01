import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddr, setNewAddr] = useState({ recipient_name: '', phone: '', street: '', sub_district: '', district: '', province: '', postal_code: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      alert(err.response?.data?.message || 'บันทึกที่อยู่ไม่สำเร็จ');
    }
  };

  const handleOrder = async () => {
    if (!selectedAddress) return alert('กรุณาเลือกที่อยู่จัดส่ง');
    setLoading(true);
    try {
      const orderRes = await api.post('/orders', { shipping_address_id: parseInt(selectedAddress) });
      const orderId = orderRes.data.order_id;
      await api.post('/payments', { order_id: orderId, method: 'mock' });
      navigate(`/orders/${orderId}?success=1`);
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ยืนยันการสั่งซื้อ</h1>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-4">
          {/* Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-700 mb-3">ที่อยู่จัดส่ง</h2>
            {addresses.length === 0 && !showForm && (
              <p className="text-sm text-gray-400 mb-3">ยังไม่มีที่อยู่ กรุณาเพิ่มที่อยู่ก่อน</p>
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
            <button onClick={() => setShowForm(!showForm)} className="text-sm text-indigo-600 hover:underline">
              + เพิ่มที่อยู่ใหม่
            </button>
            {showForm && (
              <form onSubmit={handleSaveAddress} className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { label: 'ชื่อผู้รับ', key: 'recipient_name' }, { label: 'เบอร์โทร', key: 'phone' },
                  { label: 'ที่อยู่', key: 'street' }, { label: 'แขวง/ตำบล', key: 'sub_district' },
                  { label: 'เขต/อำเภอ', key: 'district' }, { label: 'จังหวัด', key: 'province' },
                  { label: 'รหัสไปรษณีย์', key: 'postal_code' },
                ].map(({ label, key }) => (
                  <div key={key} className={key === 'street' ? 'col-span-2' : ''}>
                    <label className="text-xs text-gray-500">{label}</label>
                    <input
                      value={newAddr[key]}
                      onChange={e => setNewAddr({ ...newAddr, [key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm mt-0.5"
                      required
                    />
                  </div>
                ))}
                <div className="col-span-2 flex gap-2 mt-1">
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm">บันทึก</button>
                  <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400">ยกเลิก</button>
                </div>
              </form>
            )}
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-700 mb-2">การชำระเงิน</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input type="radio" checked readOnly /> <span>Mock Payment (ทดสอบ)</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h2 className="font-semibold text-gray-700 mb-3">สรุปคำสั่งซื้อ</h2>
            <div className="space-y-2 mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1">{item.name} × {item.quantity}</span>
                  <span className="text-gray-700 ml-2">฿{Number(item.subtotal).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
              <span>รวม</span>
              <span className="text-indigo-600">฿{Number(cart.total).toLocaleString()}</span>
            </div>
            <button
              onClick={handleOrder}
              disabled={loading}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'กำลังดำเนินการ...' : 'ยืนยันและชำระเงิน'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
