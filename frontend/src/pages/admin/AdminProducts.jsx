import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { EmptyState, LoadingState, Notice } from '../../components/ui/Feedback';

const emptyForm = { name: '', description: '', price: '', stock_qty: '', category_id: '', image_url: '' };
const stockFilters = ['all', 'low', 'out'];
const getStockFilterFromParams = (searchParams) => {
  const value = searchParams.get('stock');
  return stockFilters.includes(value) ? value : 'all';
};

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [stockDrafts, setStockDrafts] = useState({});
  const [savingStockId, setSavingStockId] = useState(null);
  const [stockFilter, setStockFilter] = useState(() => getStockFilterFromParams(searchParams));

  const getStockQty = (product) => Number(product.stock_qty || 0);
  const isLowStock = (product) => {
    const stockQty = getStockQty(product);
    return stockQty > 0 && stockQty <= 10;
  };
  const isOutOfStock = (product) => getStockQty(product) === 0;
  const updateStockFilter = (nextFilter) => {
    setStockFilter(nextFilter);
    const nextParams = new URLSearchParams(searchParams);
    if (nextFilter === 'all') {
      nextParams.delete('stock');
    } else {
      nextParams.set('stock', nextFilter);
    }
    setSearchParams(nextParams, { replace: true });
  };
  const clearStockFilter = () => updateStockFilter('all');

  const fetchProducts = () => {
    api.get('/products', { params: { limit: 100 } })
      .then(r => setProducts(r.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get('/products/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    setStockFilter(getStockFilterFromParams(searchParams));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/products/${editing}`, form);
      } else {
        await api.post('/products', form);
      }
      setForm(emptyForm);
      setEditing(null);
      setMessage({ type: 'success', text: editing ? 'Product updated.' : 'Product created.' });
      fetchProducts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to save product.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name, description: product.description || '',
      price: product.price, stock_qty: product.stock_qty,
      category_id: product.category_id, image_url: product.image_url || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setMessage({ type: 'success', text: 'Product deleted.' });
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to delete product.' });
    }
  };

  const updateStockDraft = (id, value) => {
    setStockDrafts(current => ({ ...current, [id]: value }));
  };

  const handleStockSave = async (product) => {
    const nextStock = Number(stockDrafts[product.id] ?? product.stock_qty);
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      setMessage({ type: 'error', text: 'Stock must be a whole number greater than or equal to 0.' });
      return;
    }

    setSavingStockId(product.id);
    try {
      await api.put(`/admin/products/${product.id}`, { stock_qty: nextStock });
      setProducts(current => current.map(item => (
        item.id === product.id ? { ...item, stock_qty: nextStock } : item
      )));
      setStockDrafts(current => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
      setMessage({ type: 'success', text: `Stock updated for ${product.name}.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to update stock.' });
    } finally {
      setSavingStockId(null);
    }
  };

  const totalStock = products.reduce((sum, product) => sum + getStockQty(product), 0);
  const lowStockCount = products.filter(isLowStock).length;
  const outOfStockCount = products.filter(isOutOfStock).length;
  const visibleProducts = products.filter(product => {
    if (stockFilter === 'low') return isLowStock(product);
    if (stockFilter === 'out') return isOutOfStock(product);
    return true;
  });
  const activeFilterLabel = {
    all: 'All products',
    low: 'Low stock products',
    out: 'Out of stock products',
  }[stockFilter];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Product Management</h1>
      {message && (
        <div className="mb-4">
          <Notice type={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Notice>
        </div>
      )}

      {/* Form */}
      <div className="app-card p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">{editing ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          {[
            { label: 'Product Name', key: 'name', colSpan: 2 },
            { label: 'Price (THB)', key: 'price', type: 'number' },
            { label: 'Stock Quantity', key: 'stock_qty', type: 'number' },
            { label: 'Image URL', key: 'image_url', colSpan: 2 },
            { label: 'Description', key: 'description', colSpan: 2 },
          ].map(({ label, key, type = 'text', colSpan }) => (
            <div key={key} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="app-input w-full px-3 py-2 text-sm"
                required={key !== 'image_url' && key !== 'description'}
                min={type === 'number' ? 0 : undefined}
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select
              value={form.category_id}
              onChange={e => setForm({ ...form, category_id: e.target.value })}
              className="app-input w-full px-3 py-2 text-sm"
              required
            >
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-2 mt-1">
            <button type="submit" disabled={saving} className="app-button px-6 py-2 text-sm disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="text-sm text-gray-400 px-4 py-2">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Product list */}
      {loading ? <LoadingState label="Loading products..." /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { label: 'Total stock', value: totalStock, tone: 'text-brand', filter: 'all' },
              { label: 'Low stock', value: lowStockCount, tone: lowStockCount ? 'text-red-500' : 'text-brand', filter: 'low' },
              { label: 'Out of stock', value: outOfStockCount, tone: outOfStockCount ? 'text-red-500' : 'text-brand', filter: 'out' },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => updateStockFilter(item.filter)}
                className={`app-card p-4 text-left transition hover:-translate-y-0.5 hover:border-brand/30 ${
                  stockFilter === item.filter ? 'ring-2 ring-brand/25 border-brand/30' : ''
                }`}
              >
                <p className="text-xs font-semibold uppercase text-slate">{item.label}</p>
                <p className={`mt-2 text-2xl font-black tabular-nums ${item.tone}`}>{item.value}</p>
              </button>
            ))}
          </div>

          <div className="app-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-gray-800">{activeFilterLabel}</p>
              <p className="text-xs text-slate">{visibleProducts.length} line item{visibleProducts.length === 1 ? '' : 's'} shown</p>
            </div>
            {stockFilter !== 'all' && (
              <button
                type="button"
                onClick={clearStockFilter}
                className="app-button-secondary px-3 py-1.5 text-xs"
              >
                Clear filter
              </button>
            )}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-8 h-8 object-cover rounded" />
                      ) : <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs">📦</div>}
                      <span className="font-medium text-gray-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category_name}</td>
                  <td className="px-4 py-3 text-brand font-medium">THB {Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[170px] items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={stockDrafts[p.id] ?? p.stock_qty}
                        onChange={e => updateStockDraft(p.id, e.target.value)}
                        className="app-input w-20 px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleStockSave(p)}
                        disabled={savingStockId === p.id || String(stockDrafts[p.id] ?? p.stock_qty) === String(p.stock_qty)}
                        className="app-button px-3 py-1 text-xs disabled:opacity-50"
                      >
                        {savingStockId === p.id ? 'Saving' : 'Save'}
                      </button>
                      {isOutOfStock(p) && <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-500">Out</span>}
                      {isLowStock(p) && <span className="rounded-full bg-brand-light px-2 py-1 text-xs font-semibold text-brand-dark">Low</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="text-brand hover:underline text-xs">Edit</button>
                      {deleteId === p.id ? (
                        <>
                          <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">Confirm</button>
                          <button onClick={() => setDeleteId(null)} className="text-slate hover:underline text-xs">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteId(p.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-4">
              <EmptyState title="No products yet" message="Create your first product using the form above." />
            </div>
          )}
          {products.length > 0 && visibleProducts.length === 0 && (
            <div className="p-4">
              <EmptyState
                title="No matching stock items"
                message="There are no products in this stock group right now."
                actionLabel="Show all products"
                onAction={clearStockFilter}
              />
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
