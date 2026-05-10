import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { EmptyState, Notice, ProductGridSkeleton } from '../../components/ui/Feedback';

const defaultFilters = { keyword: '', category_id: '', min_price: '', max_price: '', sort: '' };

export default function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [filters, setFilters] = useState(defaultFilters);
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
      setMessage({ type: 'error', text: 'Unable to load products. Please try again.' });
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

  const applyFilters = (nextFilters, nextPage = 1) => {
    setFilters(nextFilters);
    setPage(nextPage);
    searchProducts(nextFilters, nextPage);
  };

  const clearFilters = () => {
    applyFilters(defaultFilters, 1);
  };

  const handleSortChange = (sortValue) => {
    const newFilters = { ...filters, sort: sortValue };
    applyFilters(newFilters, 1);
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
      setMessage({ type: 'success', text: 'Added to cart.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to add this product to cart.' });
    } finally {
      setAddingId(null);
    }
  };

  const controlCls = 'app-input px-3 py-2 text-sm';
  const hasActiveFilters = Boolean(filters.keyword || filters.category_id || filters.min_price || filters.max_price || filters.sort);
  const getStockQty = (product) => Number(product.stock_qty || 0);

  // Carousel handlers
  const prevCarousel = () => {
    setCarouselIndex(prev => (prev === 0 ? bestSellers.length - 1 : prev - 1));
  };

  const nextCarousel = () => {
    setCarouselIndex(prev => (prev === bestSellers.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-6">
      {message && (
        <Notice type={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Notice>
      )}

      {/* ── Category Tabs ── */}
      <div className="app-card p-3 overflow-x-auto">
        <div className="flex gap-2 min-w-min">
          <button
            onClick={() => applyFilters({ ...filters, category_id: '' }, 1)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filters.category_id === '' 
                ? 'bg-brand text-white' 
                : 'bg-snow text-copy hover:bg-brand-light'
            }`}
          >
            🔥 All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => applyFilters({ ...filters, category_id: cat.id }, 1)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filters.category_id === cat.id 
                  ? 'bg-brand text-white' 
                  : 'bg-snow text-copy hover:bg-brand-light'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Carousel Banner ── */}
      {bestSellers.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 h-72">
          {/* Carousel content */}
          <div className="h-full flex items-center justify-between px-8 lg:px-16">
            {/* Left section */}
            <div className="flex-1 text-white z-10">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#E5D64B' }}>
                ⭐ Customer's Favorite
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
                {bestSellers[carouselIndex]?.name}
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                THB {Number(bestSellers[carouselIndex]?.price || 0).toLocaleString()}
              </p>
              <Link
                to={`/products/${bestSellers[carouselIndex]?.id}`}
                className="app-button inline-block px-6 py-3"
              >
                View Details →
              </Link>
            </div>

            {/* Right section - image */}
            <div className="hidden lg:flex flex-1 items-center justify-end h-full">
              {bestSellers[carouselIndex]?.image_url && (
                <img
                  src={bestSellers[carouselIndex].image_url}
                  alt={bestSellers[carouselIndex].name}
                  className="h-full object-contain drop-shadow-2xl"
                />
              )}
            </div>
          </div>

          {/* Carousel controls */}
          <button
            onClick={prevCarousel}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-md"
          >
            ←
          </button>
          <button
            onClick={nextCarousel}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-md"
          >
            →
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
            {bestSellers.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === carouselIndex ? 'bg-brand w-6' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <form
        onSubmit={handleSearch}
        className="app-card p-3 flex flex-wrap gap-2 items-center"
      >
        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
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
          <option value="">All Categories</option>
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
            placeholder="THB Min"
          />
          <span className="text-slate text-sm">–</span>
          <input
            type="number"
            value={filters.max_price}
            onChange={e => setFilters({ ...filters, max_price: e.target.value })}
            className={`w-24 ${controlCls}`}
            min="0"
            placeholder="THB Max"
          />
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={e => handleSortChange(e.target.value)}
          className={`min-w-36 ${controlCls}`}
        >
          <option value="">Sort: Newest</option>
          <option value="name_asc">Name A → Z</option>
          <option value="price_asc">Price Low → High</option>
        </select>

        <button
          type="submit"
          className="app-button text-sm px-5 py-2 whitespace-nowrap"
        >
          Search
        </button>
      </form>

      {/* ── Section Title ── */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-xl font-bold text-ink">📦 All Products</h2>
        {/* Optional: Show active filters count */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-brand font-semibold hover:underline"
          >
            Clear Filters ✕
          </button>
        )}
      </div>
      {loading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          message="Try clearing filters or searching with a different product name."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              className="app-card overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform duration-200"
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
                      THB {Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate">{getStockQty(product)} left</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingId === product.id || getStockQty(product) === 0}
                    className="app-button w-full text-xs py-1.5 disabled:bg-ui-border disabled:text-slate disabled:cursor-not-allowed"
                  >
                    {getStockQty(product) === 0
                      ? 'Out of Stock' 
                      : addingId === product.id 
                        ? 'Adding...'
                        : !user 
                          ? '🔐 Sign In'
                          : '+ Add to Cart'}
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
                  ? 'bg-brand text-white'
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
