import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { to: '/products', label: 'สินค้าทั้งหมด', icon: '🛍️' },
    { to: '/cart', label: 'ตะกร้าสินค้า', icon: '🛒' },
    { to: '/orders', label: 'ประวัติการสั่งซื้อ', icon: '📦' },
  ];

  const adminItems = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/products', label: 'จัดการสินค้า', icon: '📝' },
    { to: '/admin/orders', label: 'จัดการออเดอร์', icon: '✅' },
    { to: '/admin/categories', label: 'หมวดหมู่', icon: '📂' },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-6 right-6 z-40 lg:hidden bg-brand text-white p-3 rounded-full shadow-lg hover:bg-brand-dark transition-colors"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-ui-border z-40 transform transition-transform duration-300 lg:static lg:transform-none lg:z-auto pt-20 lg:pt-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-2">
          {/* Main Menu */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate uppercase mb-3 px-3">เมนู</p>
            {menuItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-copy hover:text-ink hover:bg-snow rounded-lg transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Admin Menu */}
          {user?.role === 'admin' && (
            <div className="pt-6 border-t border-ui-border">
              <p className="text-xs font-semibold text-slate uppercase mb-3 px-3">Admin</p>
              {adminItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-copy hover:text-brand hover:bg-snow rounded-lg transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
