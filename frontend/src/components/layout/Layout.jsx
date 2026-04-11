import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 text-center text-sm text-gray-400 py-4">
        © 2025 DaviDice — CPE241 Project
      </footer>
    </div>
  );
}
