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

  const inputCls = 'w-full border border-ui-border rounded-[8px] px-3 py-2 text-sm text-ink placeholder-slate bg-white focus:outline-none focus:border-black transition-colors duration-200';

  return (
    <div>
      {/* Dark hero banner */}
      <div className="rounded-[12px] px-8 py-10 mb-8 flex items-end justify-between" style={{ backgroundColor: '#222126' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F0B90B' }}>DaviDice Store</p>
          <h1 className="font-bold text-white leading-none" style={{ fontSize: '34px' }}>สินค้าทั้งหมด</h1>
          <p className="text-sm mt-2" style={{ color: '#848E9C' }}>เลือกซื้อลูกเต๋าและอุปกรณ์เกมคุณภาพสูง</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'สินค้า', value: 'หลากหลาย' },
            { label: 'จัดส่ง', value: 'ทั่วประเทศ' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-base font-bold" style={{ color: '#F0B90B' }}>{value}</p>
              <p className="text-xs" style={{ color: '#848E9C' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-[12px] border border-ui-border shadow-[rgba(32,32,37,0.05)_0px_3px_5px_0px] p-4 mb-6 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-semibold text-slate mb-1">ค้นหา</label>
          <input
            type="text"
            placeholder="ชื่อสินค้า..."
            value={filters.keyword}
            onChange={e => setFilters({ ...filters, keyword: e.target.value })}
            className={inputCls}
          />
        </div>
        <div className="min-w-36">
          <label className="block text-xs font-semibold text-slate mb-1">หมวดหมู่</label>
          <select
            value={filters.category_id}
            onChange={e => setFilters({ ...filters, category_id: e.target.value })}
            className={inputCls}
          >
            <option value="">ทั้งหมด</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="min-w-28">
          <label className="block text-xs font-semibold text-slate mb-1">ราคาต่ำสุด</label>
          <input
            type="number"
            value={filters.min_price}
            onChange={e => setFilters({ ...filters, min_price: e.target.value })}
            className={inputCls}
            min="0"
            placeholder="0"
          />
        </div>
        <div className="min-w-28">
          <label className="block text-xs font-semibold text-slate mb-1">ราคาสูงสุด</label>
          <input
            type="number"
            value={filters.max_price}
            onChange={e => setFilters({ ...filters, max_price: e.target.value })}
            className={inputCls}
            min="0"
            placeholder="9999"
          />
        </div>
        <button
          type="submit"
          className="bg-brand text-ink font-semibold text-sm px-6 py-2 rounded-[6px] hover:bg-brand-hover hover:text-white transition-colors duration-200"
        >
          ค้นหา
        </button>
      </form>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate">กำลังโหลด...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-slate">ไม่พบสินค้า</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-[12px] border border-ui-border shadow-[rgba(32,32,37,0.05)_0px_3px_5px_0px] hover:shadow-[rgba(8,8,8,0.05)_0px_3px_5px_5px] transition-shadow duration-200 overflow-hidden"
            >
              <Link to={`/products/${product.id}`}>
                <div className="aspect-square bg-snow overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate text-4xl">📦</div>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/products/${product.id}`}>
                  <p className="text-sm font-semibold text-ink truncate hover:text-brand transition-colors duration-200">
                    {product.name}
                  </p>
                </Link>
                <p className="text-xs text-slate mt-0.5">{product.category_name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-brand font-bold text-sm tabular-nums">
                    ฿{Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate">คงเหลือ {product.stock_qty}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={addingId === product.id || product.stock_qty === 0}
                  className="mt-2 w-full bg-brand text-ink text-xs font-semibold py-1.5 rounded-[6px] hover:bg-brand-hover hover:text-white transition-colors duration-200 disabled:bg-ui-border disabled:text-slate disabled:cursor-not-allowed"
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
              className={`w-9 h-9 rounded-[6px] text-sm font-semibold transition-colors duration-200 ${
                p === page
                  ? 'bg-brand text-ink'
                  : 'bg-white border border-ui-border text-copy hover:border-brand hover:text-brand'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
