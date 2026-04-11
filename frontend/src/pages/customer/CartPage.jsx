import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">กรุณาเข้าสู่ระบบก่อน</p>
      <button onClick={() => navigate('/login')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">เข้าสู่ระบบ</button>
    </div>
  );

  if (cart.items.length === 0) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">🛒</p>
      <p className="text-gray-500 mb-4">ตะกร้าของคุณว่างเปล่า</p>
      <button onClick={() => navigate('/products')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">เลือกซื้อสินค้า</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ตะกร้าสินค้า</h1>

      <div className="space-y-3 mb-6">
        {cart.items.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-sm text-indigo-600">฿{Number(item.price).toLocaleString()}</p>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm"
              >−</button>
              <span className="px-3 py-1 text-sm border-x border-gray-200">{item.quantity}</span>
              <button
                onClick={() => updateItem(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock_qty}
                className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm disabled:opacity-40"
              >+</button>
            </div>
            <p className="text-sm font-bold text-gray-700 w-20 text-right">
              ฿{Number(item.subtotal).toLocaleString()}
            </p>
            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">รวมทั้งหมด</span>
          <span className="text-2xl font-bold text-indigo-600">฿{Number(cart.total).toLocaleString()}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={clearCart} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">
            ล้างตะกร้า
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className="flex-2 bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
          >
            สั่งซื้อ →
          </button>
        </div>
      </div>
    </div>
  );
}
