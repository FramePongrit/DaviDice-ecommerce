import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', category_id: '', min_price: '', max_price: '', sort: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);

  const searchProducts = async (searchFilters, searchPage) => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { ...searchFilters, page: searchPage, limit: 20 } });
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
    api.get('/products/bestsellers').then(r => setBestSellers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    searchProducts(filters, page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    searchProducts(filters, 1);
  };

  const handleSortChange = (sortValue) => {
    const newFilters = { ...filters, sort: sortValue };
    setFilters(newFilters);
    setPage(1);
    searchProducts(newFilters, 1);
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

  const controlCls = 'border border-ui-border rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors';

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <div
        className="rounded-2xl px-8 py-10 flex items-center justify-between"
        style={{ backgroundColor: '#222126' }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F0B90B' }}>
            DaviDice Store
          </p>
          <h1 className="text-4xl font-bold text-white leading-none">สินค้าทั้งหมด</h1>
          <p className="text-sm mt-2" style={{ color: '#848E9C' }}>
            เลือกซื้อลูกเต๋าและอุปกรณ์เกมคุณภาพสูง
          </p>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[{ label: 'สินค้า', value: 'หลากหลาย' }, { label: 'จัดส่ง', value: 'ทั่วประเทศ' }].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-bold" style={{ color: '#F0B90B' }}>{value}</p>
              <p className="text-xs" style={{ color: '#848E9C' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Best Sellers Strip ── */}
      {bestSellers.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-1.5">
            <span style={{ color: '#F0B90B' }}>★</span> สินค้าขายดี
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {bestSellers.map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="flex-shrink-0 w-36 bg-white rounded-xl border border-ui-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square overflow-hidden bg-snow">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl text-slate">📦</div>
                  }
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-ink truncate">{product.name}</p>
                  <p className="text-xs font-bold mt-0.5 tabular-nums" style={{ color: '#F0B90B' }}>
                    ฿{Number(product.price).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl border border-ui-border shadow-sm p-3 flex flex-wrap gap-2 items-center"
      >
        {/* Search */}
        <input
          type="text"
          placeholder="ค้นหาสินค้า..."
          value={filters.keyword}
          onChange={e => setFilters({ ...filters, keyword: e.target.value })}
          className={`flex-1 min-w-44 ${controlCls}`}
        />

        {/* Category */}
        <select
          value={filters.category_id}
          onChange={e => setFilters({ ...filters, category_id: e.target.value })}
          className={`min-w-36 ${controlCls}`}
        >
          <option value="">หมวดหมู่ทั้งหมด</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* Price range */}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={filters.min_price}
            onChange={e => setFilters({ ...filters, min_price: e.target.value })}
            className={`w-24 ${controlCls}`}
            min="0"
            placeholder="฿ ต่ำสุด"
          />
          <span className="text-slate text-sm">–</span>
          <input
            type="number"
            value={filters.max_price}
            onChange={e => setFilters({ ...filters, max_price: e.target.value })}
            className={`w-24 ${controlCls}`}
            min="0"
            placeholder="฿ สูงสุด"
          />
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={e => handleSortChange(e.target.value)}
          className={`min-w-36 ${controlCls}`}
        >
          <option value="">เรียง: ล่าสุด</option>
          <option value="name_asc">ชื่อ A → Z</option>
          <option value="price_asc">ราคา ต่ำ → สูง</option>
        </select>

        <button
          type="submit"
          className="bg-brand text-ink font-semibold text-sm px-5 py-2 rounded-lg hover:bg-brand-hover hover:text-white transition-colors whitespace-nowrap"
        >
          ค้นหา
        </button>
      </form>

      {/* ── Product Grid ── */}
      {loading ? (
        <div className="text-center py-24 text-slate">กำลังโหลด...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-slate">ไม่พบสินค้า</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-ui-border overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200"
            >
              {/* Image — strict square */}
              <Link to={`/products/${product.id}`} className="block flex-shrink-0">
                <div className="aspect-square w-full overflow-hidden bg-snow">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl text-slate">📦</div>
                  }
                </div>
              </Link>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-slate">{product.category_name}</p>
                <Link to={`/products/${product.id}`}>
                  <p className="text-sm font-semibold text-ink line-clamp-2 mt-0.5 leading-snug hover:text-brand transition-colors">
                    {product.name}
                  </p>
                </Link>

                {/* Price + stock pushed to bottom */}
                <div className="mt-auto pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-brand font-bold text-sm tabular-nums">
                      ฿{Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate">เหลือ {product.stock_qty}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingId === product.id || product.stock_qty === 0}
                    className="w-full bg-brand text-ink text-xs font-semibold py-1.5 rounded-lg hover:bg-brand-hover hover:text-white transition-colors disabled:bg-ui-border disabled:text-slate disabled:cursor-not-allowed"
                  >
                    {product.stock_qty === 0 ? 'สินค้าหมด' : addingId === product.id ? 'กำลังเพิ่ม...' : '+ ใส่ตะกร้า'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-4 pb-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
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
