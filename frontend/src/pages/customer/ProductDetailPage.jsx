import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      navigate('/cart');
    } catch (err) {
      alert(err.response?.data?.message || 'กรุณาเข้าสู่ระบบก่อน');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;
  if (!product) return null;

  const primaryImage = product.images?.find(i => i.is_primary)?.image_url || product.images?.[0]?.image_url;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">
        ← กลับ
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 aspect-square bg-gray-100">
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📦</div>
            )}
          </div>
          <div className="md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <p className="text-sm text-indigo-500 mb-1">{product.category_name}</p>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-indigo-600 mb-4">฿{Number(product.price).toLocaleString()}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{product.description}</p>
              <p className="text-sm text-gray-400">คงเหลือ: <span className="font-medium text-gray-600">{product.stock_qty} ชิ้น</span></p>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm text-gray-600">จำนวน:</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                  >−</button>
                  <span className="px-4 py-1.5 text-sm font-medium border-x border-gray-200">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_qty, q + 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                  >+</button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock_qty === 0}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {product.stock_qty === 0 ? 'สินค้าหมด' : adding ? 'กำลังเพิ่ม...' : '🛒 เพิ่มลงตะกร้า'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
