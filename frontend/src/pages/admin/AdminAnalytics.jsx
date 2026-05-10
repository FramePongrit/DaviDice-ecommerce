import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CalendarDays,
  DollarSign,
  PackageCheck,
  UsersRound,
} from 'lucide-react';
import api from '../../api/axios';
import { LoadingState, Notice } from '../../components/ui/Feedback';

const money = (value) => `THB ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const number = (value) => Number(value || 0).toLocaleString();

const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);
const monthStart = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
};

const presets = [
  { label: 'Today', from: today, to: today, granularity: 'daily' },
  { label: '7 Days', from: () => dateOffset(6), to: today, granularity: 'daily' },
  { label: '30 Days', from: () => dateOffset(29), to: today, granularity: 'daily' },
  { label: 'This Month', from: monthStart, to: today, granularity: 'daily' },
  { label: '12 Months', from: () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11);
    date.setDate(1);
    return date.toISOString().slice(0, 10);
  }, to: today, granularity: 'monthly' },
];

function SummaryCard({ icon: Icon, label, value, caption }) {
  return (
    <section className="app-card p-4">
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

function RevenueTrend({ rows }) {
  if (!rows?.length) return <div className="grid h-72 place-items-center text-sm text-slate">No revenue in this period</div>;

  const width = 760;
  const height = 230;
  const values = rows.map((row) => Number(row.revenue || 0));
  const max = Math.max(...values, 1);
  const stepX = width / Math.max(rows.length - 1, 1);
  const points = values.map((value, index) => ({
    x: index * stepX,
    y: height - (value / max) * (height - 32) - 16,
    row: rows[index],
  }));
  const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const fill = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div>
      <div className="h-72">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="analyticsRevenueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#24883B" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#24883B" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <line key={tick} x1="0" x2={width} y1={height * tick} y2={height * tick} stroke="#eeeeee" strokeDasharray="8 8" />
          ))}
          <path d={fill} fill="url(#analyticsRevenueFill)" />
          <path d={line} fill="none" stroke="#24883B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          {points.map((point) => (
            <circle key={point.row.bucket} cx={point.x} cy={point.y} r="5" fill="#fff" stroke="#24883B" strokeWidth="3" />
          ))}
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate sm:grid-cols-6">
        {rows.slice(-6).map((row) => (
          <span key={row.bucket} className="truncate">{row.bucket}</span>
        ))}
      </div>
    </div>
  );
}

function DataTable({ title, columns, rows, empty }) {
  return (
    <section className="app-card overflow-hidden">
      <div className="border-b border-black/5 px-5 py-4">
        <h2 className="text-lg font-black text-ink">{title}</h2>
      </div>
      {rows?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-snow">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id || row.category || row.status || index} className="border-t border-black/5">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-copy">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-10 text-center text-sm font-semibold text-slate">{empty}</div>
      )}
    </section>
  );
}

export default function AdminAnalytics() {
  const [filters, setFilters] = useState(() => ({
    from: dateOffset(29),
    to: today(),
    granularity: 'daily',
  }));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadAnalytics = async (nextFilters = filters) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await api.get('/admin/analytics/overview', { params: nextFilters });
      setData(response.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to load analytics.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPreset = (preset) => {
    const nextFilters = {
      from: preset.from(),
      to: preset.to(),
      granularity: preset.granularity,
    };
    setFilters(nextFilters);
    loadAnalytics(nextFilters);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loadAnalytics(filters);
  };

  const summary = data?.summary || {};
  const inventory = data?.inventory || {};
  const customers = data?.customers || {};
  const statusRows = useMemo(() => {
    const rows = data?.status_breakdown || [];
    const total = rows.reduce((sum, row) => sum + Number(row.count || 0), 0) || 1;
    return rows.map((row) => ({ ...row, pct: Math.round((Number(row.count || 0) / total) * 100) }));
  }, [data]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-ink">Analytics</h1>
          <p className="mt-1 text-sm text-slate">Revenue, orders, products, inventory, and customer trends.</p>
        </div>
        <form onSubmit={handleSubmit} className="app-card flex flex-wrap items-end gap-3 p-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate">From</label>
            <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} className="app-input h-10 px-3 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate">To</label>
            <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} className="app-input h-10 px-3 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate">View</label>
            <select value={filters.granularity} onChange={(event) => setFilters({ ...filters, granularity: event.target.value })} className="app-input h-10 px-3 text-sm">
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button type="submit" className="app-button h-10 px-4 text-sm">Apply</button>
        </form>
      </header>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="app-button-secondary px-3 py-2 text-xs">
            {preset.label}
          </button>
        ))}
      </div>

      {message && <Notice type={message.type} onClose={() => setMessage(null)}>{message.text}</Notice>}

      {loading ? <LoadingState label="Loading analytics..." /> : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={DollarSign} label="Total Revenue" value={money(summary.revenue)} caption={`Collected ${money(summary.collected_revenue)}`} />
            <SummaryCard icon={PackageCheck} label="Orders" value={number(summary.orders)} caption={`AOV ${money(summary.average_order_value)}`} />
            <SummaryCard icon={AlertTriangle} label="Cancelled Orders" value={number(summary.cancelled_orders)} caption={`Pending ${money(summary.pending_revenue)}`} />
            <SummaryCard icon={UsersRound} label="Active Customers" value={number(customers.active_customers)} caption={`${number(customers.repeat_customers)} repeat`} />
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
            <div className="app-card p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-ink">Revenue Trend</h2>
                  <p className="mt-1 text-sm text-slate">{filters.granularity === 'monthly' ? 'Monthly' : 'Daily'} revenue and order movement.</p>
                </div>
                <CalendarDays size={22} className="text-brand" />
              </div>
              <RevenueTrend rows={data?.trend || []} />
            </div>

            <div className="app-card p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-xl font-black text-ink">Order Status</h2>
                <BarChart3 size={22} className="text-brand" />
              </div>
              <div className="space-y-4">
                {statusRows.length ? statusRows.map((row) => (
                  <div key={row.status}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold capitalize text-copy">{row.status}</span>
                      <span className="font-black text-ink">{number(row.count)} · {row.pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-light">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                )) : <p className="py-8 text-center text-sm text-slate">No orders in this period</p>}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={Boxes} label="Total Stock" value={number(inventory.total_stock)} caption={`${number(inventory.total_products)} products`} />
            <SummaryCard icon={AlertTriangle} label="Low Stock" value={number(inventory.low_stock)} caption="1-10 units left" />
            <SummaryCard icon={Boxes} label="Out of Stock" value={number(inventory.out_of_stock)} caption="Needs restock" />
            <SummaryCard icon={DollarSign} label="Stock Value" value={money(inventory.stock_value)} caption={`${number(inventory.unsold_stock)} unsold stock`} />
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <DataTable
              title="Top Products"
              rows={data?.top_products || []}
              empty="No product sales in this period."
              columns={[
                { key: 'name', label: 'Product', render: (row) => <div><p className="font-bold text-ink">{row.name}</p><p className="text-xs text-slate">{row.category || 'Uncategorized'}</p></div> },
                { key: 'total_qty', label: 'Qty', render: (row) => number(row.total_qty) },
                { key: 'revenue', label: 'Revenue', render: (row) => <span className="font-bold text-brand">{money(row.revenue)}</span> },
                { key: 'stock_qty', label: 'Stock', render: (row) => number(row.stock_qty) },
              ]}
            />
            <DataTable
              title="Top Categories"
              rows={data?.top_categories || []}
              empty="No category sales in this period."
              columns={[
                { key: 'category', label: 'Category', render: (row) => <span className="font-bold text-ink">{row.category || 'Uncategorized'}</span> },
                { key: 'total_qty', label: 'Qty', render: (row) => number(row.total_qty) },
                { key: 'revenue', label: 'Revenue', render: (row) => <span className="font-bold text-brand">{money(row.revenue)}</span> },
              ]}
            />
          </section>
        </>
      )}
    </div>
  );
}
