import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  Dice5,
  FolderTree,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PackageCheck,
  ShoppingCart,
  Store,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/orders', label: 'Orders', icon: PackageCheck },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  const linkClass = ({ isActive }) => (
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
      isCollapsed ? 'lg:justify-center lg:px-3' : ''
    } ${
      isActive
        ? 'bg-brand text-white shadow-[0_10px_22px_rgba(36,136,59,0.22)]'
        : 'text-[#777777] hover:bg-brand-light hover:text-[#151515]'
    }`
  );

  if (isAdminArea) {
    return (
      <>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-brand text-lg font-bold text-white shadow-lg lg:hidden"
          aria-label="Toggle admin menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {isOpen && <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setIsOpen(false)} aria-label="Close admin menu" />}
        <aside
          className={`fixed left-0 top-0 z-40 h-screen w-72 transform border-r border-black/5 bg-white transition-all duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${
            isCollapsed ? 'lg:w-24' : 'lg:w-72'
          } ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col p-6">
            <div className="mb-10 flex items-center justify-between gap-3">
              <Link to="/admin" onClick={() => setIsOpen(false)} className={`flex min-w-0 items-center gap-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand text-xl font-black text-white"><Dice5 size={24} /></span>
                <span className={`text-2xl font-black tracking-tight text-[#151515] ${isCollapsed ? 'lg:hidden' : ''}`}>
                  Davi<span className="text-brand-gold">Dice</span>
                </span>
              </Link>
              <button
                onClick={() => setIsCollapsed((value) => !value)}
                className="hidden h-9 w-9 flex-shrink-0 place-items-center rounded-xl border border-black/5 bg-white text-sm font-black text-brand shadow-sm transition hover:bg-brand-light lg:grid"
                aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
                title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
              >
                {isCollapsed ? <PanelLeftOpen size={18} strokeWidth={2.4} /> : <PanelLeftClose size={18} strokeWidth={2.4} />}
              </button>
            </div>

            <nav className="space-y-2">
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.to === '/admin'} onClick={() => setIsOpen(false)} className={linkClass}>
                    <span className="grid h-6 w-6 place-items-center rounded-md border border-current/20 text-xs"><Icon size={15} /></span>
                    <span className={isCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-8 border-t border-black/5 pt-6">
              <NavLink to="/products" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#777777] hover:bg-brand-light hover:text-[#151515] ${isCollapsed ? 'lg:justify-center lg:px-3' : ''}`}>
                <span className="grid h-6 w-6 place-items-center rounded-md border border-current/20 text-xs"><Store size={15} /></span>
                <span className={isCollapsed ? 'lg:hidden' : ''}>Storefront</span>
              </NavLink>
            </div>

            <div className={`mt-auto rounded-2xl bg-brand-light p-4 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-bold text-[#151515]">{user?.name || 'Admin'}</p>
              <p className="mt-1 text-xs text-[#8b8b8b]">Store administrator</p>
            </div>
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-brand p-3 text-ink shadow-lg transition-colors hover:bg-brand-dark lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform overflow-y-auto border-r border-ui-border bg-white pt-20 transition-all duration-300 lg:static lg:z-auto lg:translate-x-0 lg:pt-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="space-y-2 p-4">
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between px-3">
              <p className={`text-xs font-semibold uppercase text-slate ${isCollapsed ? 'lg:hidden' : ''}`}>Menu</p>
              <button
                onClick={() => setIsCollapsed((value) => !value)}
                className="hidden h-8 w-8 place-items-center rounded-lg border border-black/5 bg-white text-xs font-black text-brand shadow-sm transition hover:bg-brand-light lg:grid"
                aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
                title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
              >
                {isCollapsed ? <PanelLeftOpen size={16} strokeWidth={2.4} /> : <PanelLeftClose size={16} strokeWidth={2.4} />}
              </button>
            </div>
            <NavLink to="/products" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-copy transition-colors hover:bg-snow hover:text-ink ${isCollapsed ? 'lg:justify-center' : ''}`}>
              <span className="grid h-6 w-6 place-items-center rounded-md border border-current/20 text-xs"><Boxes size={15} /></span>
              <span className={isCollapsed ? 'lg:hidden' : ''}>Products</span>
            </NavLink>
            {user && (
              <>
                <NavLink to="/cart" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-copy transition-colors hover:bg-snow hover:text-ink ${isCollapsed ? 'lg:justify-center' : ''}`}>
                  <span className="grid h-6 w-6 place-items-center rounded-md border border-current/20 text-xs"><ShoppingCart size={15} /></span>
                  <span className={isCollapsed ? 'lg:hidden' : ''}>Shopping Cart</span>
                </NavLink>
                <NavLink to="/orders" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-copy transition-colors hover:bg-snow hover:text-ink ${isCollapsed ? 'lg:justify-center' : ''}`}>
                  <span className="grid h-6 w-6 place-items-center rounded-md border border-current/20 text-xs"><PackageCheck size={15} /></span>
                  <span className={isCollapsed ? 'lg:hidden' : ''}>Order History</span>
                </NavLink>
              </>
            )}
          </div>

          {user?.role === 'admin' && (
            <div className="border-t border-ui-border pt-6">
              <p className="mb-3 px-3 text-xs font-semibold uppercase text-slate">Admin</p>
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.to === '/admin'} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-copy transition-colors hover:bg-snow hover:text-brand ${isCollapsed ? 'lg:justify-center' : ''}`}>
                    <span className="grid h-6 w-6 place-items-center rounded-md border border-current/20 text-xs"><Icon size={15} /></span>
                    <span className={isCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
