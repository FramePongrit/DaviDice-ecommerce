import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isAdminArea = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAdminArea) {
    return (
      <div className="min-h-screen app-shell lg:flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="app-panel mx-auto w-full max-w-[1720px] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <div className="h-screen overflow-hidden flex flex-col bg-snow">
        <main className="min-h-0 flex-1 px-4 py-4">
          {children}
        </main>
        <footer style={{ backgroundColor: '#222126' }}>
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4 text-center">
            <p className="text-sm" style={{ color: '#848E9C' }}>Powered by David</p>
          </div>
        </footer>
      </div>
    );
  }

  if (isLandingPage) {
    return (
      <div className="h-screen overflow-hidden flex flex-col app-shell">
        <Navbar />
        <main className="min-h-0 flex-1">
          {children}
        </main>
        <footer style={{ backgroundColor: '#222126' }}>
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4 text-center">
            <p className="text-sm" style={{ color: '#848E9C' }}>Powered by David</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col app-shell">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8">
          <div className="w-full app-panel mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <footer style={{ backgroundColor: '#222126' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8 text-center">
          <p className="text-sm" style={{ color: '#848E9C' }}>Powered by David</p>
        </div>
      </footer>
    </div>
  );
}
