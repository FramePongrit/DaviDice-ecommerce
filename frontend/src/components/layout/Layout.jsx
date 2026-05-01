import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-snow">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer style={{ backgroundColor: '#222126' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

            {/* Brand */}
            <div>
              <p className="text-xl font-bold text-white">
                Davi<span style={{ color: '#F0B90B' }}>Dice</span>
              </p>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#848E9C' }}>
                ร้านขายลูกเต๋าและอุปกรณ์เกมบอร์ดคุณภาพสูง สำหรับทุกระดับผู้เล่น
              </p>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-sm font-semibold text-white mb-3">เมนู</p>
              <ul className="space-y-2">
                {[
                  { to: '/products', label: 'สินค้าทั้งหมด' },
                  { to: '/cart',     label: 'ตะกร้าสินค้า' },
                  { to: '/orders',   label: 'ติดตามออเดอร์' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm transition-colors duration-200"
                      style={{ color: '#848E9C' }}
                      onMouseEnter={e => e.target.style.color = '#ffffff'}
                      onMouseLeave={e => e.target.style.color = '#848E9C'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-sm font-semibold text-white mb-3">ติดต่อ</p>
              <div className="space-y-2">
                <p className="text-sm" style={{ color: '#848E9C' }}>support@davidice.com</p>
                <p className="text-sm" style={{ color: '#848E9C' }}>CPE241 — King Mongkut's</p>
                <p className="text-sm" style={{ color: '#848E9C' }}>University of Technology Thonburi</p>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="pt-6 flex items-center justify-between" style={{ borderTop: '1px solid #2B2F36' }}>
            <p className="text-xs" style={{ color: '#848E9C' }}>© 2025 DaviDice — CPE241 Project</p>
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: '#848E9C' }}>Powered by</span>
              <span className="text-xs font-semibold" style={{ color: '#F0B90B' }}>React + Node.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
