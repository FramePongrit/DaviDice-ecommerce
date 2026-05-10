import { Link, useNavigate } from 'react-router-dom';
import { Dice5, LayoutDashboard, PackageCheck, ShoppingCart } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 h-[76px] border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        <Link to="/" className="flex items-center gap-3 text-3xl font-black tracking-tight text-ink">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-lg font-black text-white shadow-[0_12px_24px_rgba(36,136,59,0.18)]">
            <Dice5 size={24} strokeWidth={2.6} />
          </span>
          <span>
            Davi<span className="text-brand-gold">Dice</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            to="/products"
            className="text-sm font-bold text-copy transition-colors hover:text-brand"
          >
            Our Products
          </Link>

          {user ? (
            <>
              <Link
                to="/cart"
                className="relative grid h-10 w-10 place-items-center rounded-xl bg-snow text-sm font-black text-brand transition-colors hover:bg-brand-light"
                title="Shopping Cart"
              >
                <ShoppingCart size={20} strokeWidth={2.4} />
                {cart.items.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-ink">
                    {cart.items.length}
                  </span>
                )}
              </Link>
              <Link
                to="/orders"
                className="grid h-10 w-10 place-items-center rounded-xl bg-snow text-sm font-black text-brand transition-colors hover:bg-brand-light"
                title="Order History"
              >
                <PackageCheck size={20} strokeWidth={2.4} />
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-snow text-sm font-black text-brand transition-colors hover:bg-brand-light"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard size={20} strokeWidth={2.4} />
                </Link>
              )}
              <span className="hidden text-sm font-semibold text-slate sm:block">{user.name}</span>
              <button
                onClick={handleLogout}
                className="app-button-secondary px-4 py-2 text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-bold text-copy transition-colors hover:text-brand-gold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="app-button px-6 py-2.5 text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
