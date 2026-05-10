import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Notice, LoadingState } from '../../components/ui/Feedback';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      navigate('/cart');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to add this product to cart.' });
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingState label="Loading product..." />;
  if (!product) return null;

  const primaryImage = product.images?.find(i => i.is_primary)?.image_url || product.images?.[0]?.image_url;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate hover:text-ink mb-6 flex items-center gap-1 transition-colors duration-200"
      >
        ← Back
      </button>
      {message && (
        <div className="mb-4">
          <Notice type={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Notice>
        </div>
      )}

      <div className="app-card overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 aspect-square bg-snow">
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate text-6xl">📦</div>
            )}
          </div>
          <div className="md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-brand mb-1 uppercase tracking-wide">{product.category_name}</p>
              <h1 className="text-2xl font-bold text-ink mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-brand mb-4 tabular-nums">
                THB {Number(product.price).toLocaleString()}
              </p>
              <p className="text-slate text-sm leading-relaxed mb-4">{product.description}</p>
              <p className="text-sm text-slate">
                Stock Remaining: <span className="font-semibold text-ink">{product.stock_qty} units</span>
              </p>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm font-semibold text-copy">Quantity:</label>
                <div className="flex items-center border border-ui-border rounded-[8px] overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-ink hover:bg-snow transition-colors duration-200"
                  >−</button>
                  <span className="px-4 py-1.5 text-sm font-semibold border-x border-ui-border tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_qty, q + 1))}
                    className="px-3 py-1.5 text-ink hover:bg-snow transition-colors duration-200"
                  >+</button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock_qty === 0}
                className="app-button w-full py-3 disabled:bg-ui-border disabled:text-slate disabled:cursor-not-allowed"
              >
                {product.stock_qty === 0 
                  ? 'Out of Stock' 
                  : adding 
                    ? 'Adding...'
                    : !user 
                      ? '🔐 Sign In to Buy'
                      : '🛒 Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
