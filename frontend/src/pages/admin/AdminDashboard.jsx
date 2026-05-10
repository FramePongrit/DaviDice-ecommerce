import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  DollarSign,
  PackageCheck,
  Plus,
  ShoppingBag,
  Store,
  Truck,
  UsersRound,
} from 'lucide-react';
import api from '../../api/axios';

const money = (value) => `THB ${Number(value || 0).toLocaleString()}`;
const number = (value) => Number(value || 0).toLocaleString();
const CARD = 'app-card';
const ACCENT = '#24883B';
const ACCENT_SOFT = '#F3F8C8';
const GOLD = '#E5D64B';

function RevenueChart({ data }) {
  if (!data?.length) {
    return <div className="grid h-56 place-items-center text-sm text-slate">No paid revenue yet</div>;
  }

  const height = 180;
  const width = 720;
  const values = data.map((item) => Number(item.gross_income || 0));
  const max = Math.max(...values, 1);
  const stepX = width / Math.max(data.length - 1, 1);
  const points = values.map((value, index) => ({
    x: index * stepX,
    y: height - (value / max) * (height - 28) - 14,
    item: data[index],
  }));
  const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const fill = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="h-56">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.18" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <line key={tick} x1="0" x2={width} y1={height * tick} y2={height * tick} stroke="#eeeeee" strokeDasharray="8 8" />
        ))}
        <path d={fill} fill="url(#revenueFill)" />
        <path d={line} fill="none" stroke={ACCENT} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        {points.map((point) => (
          <circle key={point.item.month} cx={point.x} cy={point.y} r="5" fill="#fff" stroke={ACCENT} strokeWidth="3" />
        ))}
      </svg>
    </div>
  );
}

function ActionCard({ to, icon: Icon, label, value, caption, tone = 'green' }) {
  const toneClass = {
    green: 'text-brand bg-brand-light border-brand/20',
    amber: 'text-[#8a6f00] bg-[#fff8cc] border-brand-gold/40',
    red: 'text-red-600 bg-red-50 border-red-100',
  }[tone];

  return (
    <Link to={to} className={`app-card group block border p-4 transition hover:-translate-y-0.5 hover:border-brand/30 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/75">
          <Icon size={20} strokeWidth={2.5} />
        </span>
        <ArrowRight size={18} className="opacity-45 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-1 text-3xl font-black tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-xs font-semibold opacity-75">{caption}</p>
    </Link>
  );
}

function SummaryCard({ icon: Icon, label, value, caption }) {
  return (
    <section className={`${CARD} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate">{label}</p>
          <p className="mt-3 text-2xl font-black text-ink tabular-nums">{value}</p>
          {caption && <p className="mt-1 text-xs font-semibold text-brand">{caption}</p>}
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-brand">
          <Icon size={20} strokeWidth={2.5} />
        </span>
      </div>
    </section>
  );
}

function StatusBadge({ status }) {
  const tone = {
    pending: 'bg-[#fff8cc] text-[#8a6f00]',
    processing: 'bg-brand-light text-brand-dark',
    shipped: 'bg-snow text-copy',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
  }[status] || 'bg-snow text-copy';

  return <span className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${tone}`}>{status}</span>;
}

function AttentionPanel({ title, actionTo, actionLabel, children }) {
  return (
    <section className={`${CARD} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
        <h2 className="text-lg font-black text-ink">{title}</h2>
        <Link to={actionTo} className="text-xs font-bold text-brand hover:underline">{actionLabel}</Link>
      </div>
      <div className="divide-y divide-black/5">{children}</div>
    </section>
  );
}

function EmptyRows({ message }) {
  return <div className="px-5 py-10 text-center text-sm font-semibold text-slate">{message}</div>;
}

function TopCategories({ categories }) {
  if (!categories?.length) return <p className="py-8 text-center text-sm text-slate">No category sales yet</p>;
  const max = Math.max(...categories.map((item) => Number(item.total_revenue || 0)), 1);

  return (
    <div className="space-y-4">
      {categories.slice(0, 5).map((item, index) => {
        const value = Number(item.total_revenue || 0);
        return (
          <div key={item.category}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-copy">{item.category}</span>
              <span className="font-bold text-ink">{money(value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-light">
              <div
                className="h-full rounded-full"
                style={{ width: `${(value / max) * 100}%`, backgroundColor: [ACCENT, GOLD, '#BFD95A', '#69B96A', '#9FCF68'][index] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [income, setIncome] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [processingOrders, setProcessingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/analytics/income'),
      api.get('/admin/analytics/sales-by-category'),
      api.get('/admin/analytics/customer-stats'),
      api.get('/admin/analytics/low-stock', { params: { threshold: 10 } }),
      api.get('/admin/orders', { params: { status: 'pending', limit: 100 } }),
      api.get('/admin/orders', { params: { status: 'processing', limit: 100 } }),
    ])
      .then(([dashboard, incomeData, categoryData, customers, lowStock, pending, processing]) => {
        setData(dashboard.data);
        setIncome(incomeData.data || []);
        setSalesByCategory(categoryData.data || []);
        setCustomerStats(customers.data || {});
        setLowStockItems(lowStock.data || []);
        setPendingOrders(pending.data || []);
        setProcessingOrders(processing.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const dashboard = useMemo(() => {
    const totalCustomers = customerStats?.total_customers || 0;
    const collectedRevenue = Number(data?.collected_revenue || 0);
    const lowOnly = lowStockItems.filter((item) => Number(item.stock_qty || 0) > 0);
    const outOnly = lowStockItems.filter((item) => Number(item.stock_qty || 0) === 0);
    const urgentOrders = [...pendingOrders, ...processingOrders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return { totalCustomers, collectedRevenue, lowOnly, outOnly, urgentOrders };
  }, [customerStats, data, lowStockItems, pendingOrders, processingOrders]);

  if (loading) return <div className="grid min-h-[70vh] place-items-center text-slate">Loading dashboard...</div>;
  if (!data) return <div className="grid min-h-[70vh] place-items-center text-slate">No dashboard data</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-slate">Store operations, stock alerts, and orders that need attention.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/products" className="app-button flex items-center gap-2 px-4 py-2 text-sm"><Plus size={16} /> Add Product</Link>
          <Link to="/admin/products?stock=low" className="app-button-secondary flex items-center gap-2 px-4 py-2 text-sm"><Boxes size={16} /> Manage Stock</Link>
          <Link to="/admin/orders" className="app-button-secondary flex items-center gap-2 px-4 py-2 text-sm"><ClipboardList size={16} /> View Orders</Link>
          <Link to="/products" className="app-button-secondary flex items-center gap-2 px-4 py-2 text-sm"><Store size={16} /> Storefront</Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard to="/admin/orders?status=pending" icon={ClipboardList} label="Pending Orders" value={number(pendingOrders.length)} caption="Needs payment review" tone="amber" />
        <ActionCard to="/admin/orders?status=processing" icon={Truck} label="Processing Orders" value={number(processingOrders.length)} caption="Prepare and ship" />
        <ActionCard to="/admin/products?stock=low" icon={AlertTriangle} label="Low Stock" value={number(dashboard.lowOnly.length)} caption="Stock is 1-10 units" tone={dashboard.lowOnly.length ? 'red' : 'green'} />
        <ActionCard to="/admin/products?stock=out" icon={Boxes} label="Out of Stock" value={number(dashboard.outOnly.length)} caption="Unavailable now" tone={dashboard.outOnly.length ? 'red' : 'green'} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={DollarSign} label="Revenue" value={money(data.total_revenue)} caption={`Collected ${money(dashboard.collectedRevenue)}`} />
        <SummaryCard icon={PackageCheck} label="Total Orders" value={number(data.total_orders)} caption={`${number(data.recent_orders?.length)} recent`} />
        <SummaryCard icon={ShoppingBag} label="Products" value={number(data.total_products)} caption="Available catalog records" />
        <SummaryCard icon={UsersRound} label="Customers" value={number(dashboard.totalCustomers)} caption={`${number(customerStats?.repeat_customers || 0)} repeat`} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AttentionPanel title="Orders Need Action" actionTo="/admin/orders?status=pending" actionLabel="View orders">
          {dashboard.urgentOrders.length === 0 ? (
            <EmptyRows message="No pending or processing orders right now." />
          ) : dashboard.urgentOrders.map((order) => (
            <Link key={order.id} to={`/admin/orders?status=${order.status}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-snow">
              <div className="min-w-0">
                <p className="font-bold text-ink">Order #{order.id}</p>
                <p className="truncate text-xs text-slate">{order.customer_name} · {new Date(order.created_at).toLocaleDateString('en-US')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-brand">{money(order.total_price)}</p>
                <StatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </AttentionPanel>

        <AttentionPanel title="Stock Needs Attention" actionTo="/admin/products?stock=low" actionLabel="Manage stock">
          {lowStockItems.length === 0 ? (
            <EmptyRows message="All tracked products have healthy stock." />
          ) : lowStockItems.slice(0, 5).map((product) => {
            const stockQty = Number(product.stock_qty || 0);
            return (
              <Link key={product.id} to={`/admin/products?stock=${stockQty === 0 ? 'out' : 'low'}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-snow">
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{product.name}</p>
                  <p className="truncate text-xs text-slate">{product.category}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-black ${stockQty === 0 ? 'bg-red-50 text-red-600' : 'bg-[#fff8cc] text-[#8a6f00]'}`}>
                  {stockQty === 0 ? 'Out' : `${stockQty} left`}
                </span>
              </Link>
            );
          })}
        </AttentionPanel>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <div className={`${CARD} p-6`}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-ink">Revenue Analytics</h2>
              <p className="mt-1 text-sm text-slate">Paid revenue trend for the last 12 months.</p>
            </div>
            <span className="rounded-xl bg-brand-light px-3 py-2 text-xs font-bold text-brand">Last 12 Months</span>
          </div>
          <RevenueChart data={income} />
        </div>

        <div className={`${CARD} p-6`}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-ink">Top Categories</h2>
            <span className="text-xs font-bold text-slate">By revenue</span>
          </div>
          <TopCategories categories={salesByCategory} />
        </div>
      </section>
    </div>
  );
}
