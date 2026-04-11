import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', category_id: '', min_price: '', max_price: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      const res = await api.get('/products', { params });
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/products/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleAddToCart = async (productId) => {
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
    } catch (err) {
      alert(err.response?.data?.message || 'กรุณาเข้าสู่ระบบก่อน');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">สินค้าทั้งหมด</h1>

      {/* Filter Bar */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40">
          <label className="block text-xs text-gray-500 mb-1">ค้นหา</label>
          <input
            type="text"
            placeholder="ชื่อสินค้า..."
            value={filters.keyword}
            onChange={e => setFilters({ ...filters, keyword: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="min-w-36">
          <label className="block text-xs text-gray-500 mb-1">หมวดหมู่</label>
          <select
            value={filters.category_id}
            onChange={e => setFilters({ ...filters, category_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">ทั้งหมด</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="min-w-28">
          <label className="block text-xs text-gray-500 mb-1">ราคาต่ำสุด</label>
          <input
            type="number"
            value={filters.min_price}
            onChange={e => setFilters({ ...filters, min_price: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
        </div>
        <div className="min-w-28">
          <label className="block text-xs text-gray-500 mb-1">ราคาสูงสุด</label>
          <input
            type="number"
            value={filters.max_price}
            onChange={e => setFilters({ ...filters, max_price: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          ค้นหา
        </button>
      </form>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">ไม่พบสินค้า</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <Link to={`/products/${product.id}`}>
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/products/${product.id}`}>
                  <p className="text-sm font-medium text-gray-800 truncate hover:text-indigo-600">{product.name}</p>
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{product.category_name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-indigo-600 font-bold text-sm">฿{Number(product.price).toLocaleString()}</span>
                  <span className="text-xs text-gray-400">คงเหลือ {product.stock_qty}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={addingId === product.id || product.stock_qty === 0}
                  className="mt-2 w-full bg-indigo-50 text-indigo-600 text-xs py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition disabled:opacity-40"
                >
                  {product.stock_qty === 0 ? 'สินค้าหมด' : addingId === product.id ? 'กำลังเพิ่ม...' : '+ ใส่ตะกร้า'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm ${p === page ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
