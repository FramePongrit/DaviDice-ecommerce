import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-ui-border sticky top-0 z-50" style={{ height: '64px' }}>
      <div className="max-w-6xl mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-ink tracking-tight">
          Davi<span className="text-brand">Dice</span>
        </Link>

        {/* Nav links + CTA */}
        <div className="flex items-center gap-6">
          <Link
            to="/products"
            className="text-sm font-semibold text-copy hover:text-ink transition-colors duration-200"
          >
            สินค้า
          </Link>

          {user ? (
            <>
              <Link
                to="/cart"
                className="relative text-sm font-semibold text-copy hover:text-ink transition-colors duration-200"
              >
                ตะกร้า
                {cart.items.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-brand text-ink text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cart.items.length}
                  </span>
                )}
              </Link>
              <Link
                to="/orders"
                className="text-sm font-semibold text-copy hover:text-ink transition-colors duration-200"
              >
                ออเดอร์
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold text-brand hover:text-brand-dark transition-colors duration-200"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-slate">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-slate hover:text-ink transition-colors duration-200"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-copy hover:text-ink transition-colors duration-200"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/register"
                className="bg-brand text-ink text-sm font-semibold px-6 py-2 rounded-[50px] shadow-[rgb(153,153,153)_0px_2px_10px_-3px] hover:bg-brand-hover hover:text-white transition-colors duration-200"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
