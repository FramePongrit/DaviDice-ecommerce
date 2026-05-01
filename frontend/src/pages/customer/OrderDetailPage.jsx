import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_LABEL = {
  pending: { label: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'กำลังเตรียมสินค้า', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'จัดส่งแล้ว', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'ได้รับสินค้าแล้ว', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-600' },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === '1';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;
  if (!order) return <div className="text-center py-20 text-gray-400">ไม่พบออเดอร์</div>;

  const s = STATUS_LABEL[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
  const total = order.items.reduce((sum, i) => sum + i.quantity * parseFloat(i.unit_price), 0);

  return (
    <div className="max-w-2xl mx-auto">
      {isSuccess && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 mb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-700 font-bold text-2xl mb-1">ชำระเงินสำเร็จ</p>
          <p className="text-green-600 text-sm">ขอบคุณสำหรับการสั่งซื้อ เราจะจัดส่งสินค้าให้เร็วที่สุด</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ออเดอร์ #{order.id}</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
      </div>

      <div className="space-y-4">
        {/* Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-3">รายการสินค้า</h2>
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
                  <p className="text-xs text-gray-400">{item.quantity} × ฿{Number(item.unit_price).toLocaleString()}</p>
                </div>
                <p className="text-sm font-medium">฿{(item.quantity * parseFloat(item.unit_price)).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between font-bold">
            <span>รวม</span>
            <span className="text-indigo-600">฿{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-2">ที่อยู่จัดส่ง</h2>
          <p className="text-sm text-gray-700">{order.recipient_name} · {order.shipping_phone}</p>
          <p className="text-sm text-gray-500">{order.street} {order.sub_district} {order.district} {order.province} {order.postal_code}</p>
        </div>

        {/* Payment */}
        {order.payment && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-700 mb-2">การชำระเงิน</h2>
            <p className="text-sm text-gray-600">วิธี: {order.payment.method} · สถานะ: <span className="text-green-600 font-medium">{order.payment.status}</span></p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/orders" className="text-sm text-gray-500 hover:text-gray-700">← ประวัติออเดอร์</Link>
        <Link to="/products" className="text-sm text-indigo-600 hover:underline">ซื้อสินค้าต่อ</Link>
      </div>
    </div>
  );
}
