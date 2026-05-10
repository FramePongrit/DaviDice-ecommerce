import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/ui/Feedback';

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingQty, setPendingQty] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const getDisplayQty = (item) =>
    pendingQty[item.id] !== undefined ? pendingQty[item.id] : String(item.quantity);

  const commitQty = (item) => {
    const raw = pendingQty[item.id];
    if (raw === undefined) return;
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 1 && num <= item.stock_qty && num !== item.quantity) {
      updateItem(item.id, num);
    }
    setPendingQty(prev => { const n = { ...prev }; delete n[item.id]; return n; });
  };

  const handleDecrease = (item) => {
    if (item.quantity <= 1) {
      setConfirmDeleteId(item.id);
    } else {
      updateItem(item.id, item.quantity - 1);
    }
  };

  const handleRemoveClick = (itemId) => setConfirmDeleteId(itemId);

  const confirmRemove = (itemId) => {
    removeItem(itemId);
    setConfirmDeleteId(null);
  };

  if (!user) return (
    <EmptyState
      title="Sign in required"
      message="Please sign in before viewing your cart."
      actionLabel="Sign in"
      onAction={() => navigate('/login')}
    />
  );

  if (cart.items.length === 0) return (
    <EmptyState
      title="Your cart is empty"
      message="Browse dice, board games, card games, and accessories to start an order."
      actionLabel="Browse products"
      onAction={() => navigate('/products')}
    />
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

      <div className="space-y-3 mb-6">
        {cart.items.map(item => (
          <div key={item.id} className="app-card p-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-sm font-bold text-brand">THB {Number(item.price).toLocaleString()}</p>
            </div>

            {/* Quantity control with typeable input */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => handleDecrease(item)}
                className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm"
              >−</button>
              <input
                type="number"
                value={getDisplayQty(item)}
                onChange={e => setPendingQty(prev => ({ ...prev, [item.id]: e.target.value }))}
                onBlur={() => commitQty(item)}
                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                min={1}
                max={item.stock_qty}
                className="w-12 text-center text-sm border-x border-gray-200 py-1 focus:outline-none"
              />
              <button
                onClick={() => updateItem(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock_qty}
                className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm disabled:opacity-40"
              >+</button>
            </div>

            <p className="text-sm font-bold text-gray-700 sm:w-20 sm:text-right">
              THB {Number(item.subtotal).toLocaleString()}
            </p>

            {/* Delete button / inline confirmation */}
            {confirmDeleteId === item.id ? (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-gray-500 whitespace-nowrap">Delete?</span>
                <button
                  onClick={() => confirmRemove(item.id)}
                  className="w-6 h-6 bg-red-500 text-white rounded text-xs flex items-center justify-center hover:bg-red-600"
                >✓</button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="w-6 h-6 bg-gray-100 text-gray-600 rounded text-xs flex items-center justify-center hover:bg-gray-200"
                >✕</button>
              </div>
            ) : (
              <button
                onClick={() => handleRemoveClick(item.id)}
                className="text-red-400 hover:text-red-600 text-sm flex-shrink-0"
              >✕</button>
            )}
          </div>
        ))}
      </div>

      <div className="app-card p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Total</span>
          <span className="text-2xl font-bold text-brand">THB {Number(cart.total).toLocaleString()}</span>
        </div>
        <div className="flex gap-3">
          {confirmClear ? (
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Clear all?</span>
              <button
                onClick={() => { clearCart(); setConfirmClear(false); }}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm hover:bg-red-600"
              >Confirm</button>
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50"
              >Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Clear Cart
            </button>
          )}
          <button
            onClick={() => navigate('/checkout')}
            className="flex-2 app-button px-8 py-2.5"
          >
            Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
