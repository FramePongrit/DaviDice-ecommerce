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
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">DaviDice</Link>

        <div className="flex items-center gap-4">
          <Link to="/products" className="text-gray-600 hover:text-indigo-600 text-sm">สินค้า</Link>

          {user ? (
            <>
              <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 text-sm">
                ตะกร้า
                {cart.items.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.items.length}
                  </span>
                )}
              </Link>
              <Link to="/orders" className="text-gray-600 hover:text-indigo-600 text-sm">ออเดอร์</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-indigo-600 font-medium text-sm">Admin</Link>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  ออกจากระบบ
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 text-sm">เข้าสู่ระบบ</Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-700"
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
