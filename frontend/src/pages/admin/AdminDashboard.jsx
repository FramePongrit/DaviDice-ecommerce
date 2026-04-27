import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_LABEL = {
  pending:    { label: 'รอชำระ',      color: 'bg-brand/10 text-brand-dark' },
  processing: { label: 'เตรียมสินค้า', color: 'bg-slate/10 text-slate' },
  shipped:    { label: 'จัดส่งแล้ว',  color: 'bg-copy/10 text-copy' },
  delivered:  { label: 'สำเร็จ',      color: 'bg-crypto-green/10 text-crypto-green' },
  cancelled:  { label: 'ยกเลิก',      color: 'bg-crypto-red/10 text-crypto-red' },
};

function BarChart({ data, valueKey, labelKey, color = '#F0B90B', formatValue }) {
  const max = Math.max(...data.map(r => parseFloat(r[valueKey])), 1);
  return (
    <div className="space-y-2">
      {data.map((row, i) => {
        const pct = (parseFloat(row[valueKey]) / max) * 100;
        const display = formatValue ? formatValue(row[valueKey]) : row[valueKey];
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-slate truncate" style={{ minWidth: '7rem', maxWidth: '7rem' }}>
              {row[labelKey]}
            </span>
            <div className="flex-1 bg-snow rounded-full h-5 overflow-hidden">
              <div
                className="h-5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-xs font-semibold text-ink text-right tabular-nums" style={{ minWidth: '5rem' }}>
              {display}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function toYearMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const cardCls = 'bg-white rounded-[12px] border border-ui-border shadow-[rgba(32,32,37,0.05)_0px_3px_5px_0px] p-5';
const inputCls = 'border border-ui-border rounded-[8px] px-2 py-1 text-sm text-ink bg-white focus:outline-none focus:border-black transition-colors duration-200';

export default function AdminDashboard() {
  const [data, setData]           = useState(null);
  const [income, setIncome]       = useState([]);
  const [lowStock, setLowStock]   = useState([]);
  const [topData, setTopData]     = useState({ month: '', products: [] });
  const [loading, setLoading]     = useState(true);

  const now = new Date();
  const defaultTo   = toYearMonth(now);
  const defaultFrom = toYearMonth(new Date(now.getFullYear() - 1, now.getMonth(), 1));

  const [incomeFrom, setIncomeFrom] = useState(defaultFrom);
  const [incomeTo,   setIncomeTo]   = useState(defaultTo);
  const [selectedMonth, setSelectedMonth] = useState(toYearMonth(now));

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/analytics/low-stock'),
    ]).then(([d, ls]) => {
      setData(d.data);
      setLowStock(ls.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/admin/analytics/income', { params: { from: incomeFrom, to: incomeTo } })
      .then(r => setIncome(r.data));
  }, [incomeFrom, incomeTo]);

  useEffect(() => {
    api.get('/admin/analytics/top-products', { params: { month: selectedMonth } })
      .then(r => setTopData(r.data));
  }, [selectedMonth]);

  if (loading) return <div className="text-center py-20 text-slate">กำลังโหลด...</div>;

  return (
    <div>
      {/* Dark header band */}
      <div className="rounded-[12px] px-8 py-8 mb-8 flex items-center justify-between" style={{ backgroundColor: '#222126' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#F0B90B' }}>DaviDice</p>
          <h1 className="font-bold text-white" style={{ fontSize: '28px' }}>Admin Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#848E9C' }}>ภาพรวมธุรกิจและการจัดการร้านค้า</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'ออเดอร์รวม',  value: data.total_orders },
            { label: 'รายได้',      value: `฿${Number(data.total_revenue).toLocaleString()}` },
            { label: 'สินค้า',      value: data.total_products },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-bold tabular-nums" style={{ color: '#F0B90B' }}>{value}</p>
              <p className="text-xs" style={{ color: '#848E9C' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'ออเดอร์ทั้งหมด', value: data.total_orders,                                icon: '📦' },
          { label: 'รายได้รวม',      value: `฿${Number(data.total_revenue).toLocaleString()}`, icon: '💰' },
          { label: 'สินค้าทั้งหมด', value: data.total_products,                               icon: '🏷️' },
        ].map(({ label, value, icon }) => (
          <div key={label} className={`${cardCls} text-center`}>
            <p className="text-3xl mb-1">{icon}</p>
            <p className="text-2xl font-bold text-ink tabular-nums">{value}</p>
            <p className="text-sm text-slate mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        {/* Gross income by month */}
        <div className={cardCls}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-ink">รายได้รวมรายเดือน</h2>
            <div className="flex items-center gap-1 text-xs text-slate">
              <input
                type="month"
                value={incomeFrom}
                max={incomeTo}
                onChange={e => setIncomeFrom(e.target.value)}
                className={inputCls}
              />
              <span>—</span>
              <input
                type="month"
                value={incomeTo}
                min={incomeFrom}
                onChange={e => setIncomeTo(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          {income.length === 0 ? (
            <p className="text-sm text-slate text-center py-6">ยังไม่มีข้อมูล</p>
          ) : (
            <BarChart
              data={income}
              labelKey="month"
              valueKey="gross_income"
              color="#F0B90B"
              formatValue={v => `฿${Number(v).toLocaleString()}`}
            />
          )}
        </div>

        {/* Top purchased products by month */}
        <div className={cardCls}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-ink">สินค้าขายดีประจำเดือน</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className={inputCls}
            />
          </div>
          {topData.products.length === 0 ? (
            <p className="text-sm text-slate text-center py-6">ไม่มีข้อมูลสินค้าในเดือนนี้</p>
          ) : (
            <BarChart
              data={topData.products}
              labelKey="name"
              valueKey="total_qty"
              color="#0ECB81"
              formatValue={v => `${v} ชิ้น`}
            />
          )}
        </div>
      </div>

      {/* Low stock table */}
      <div className={`${cardCls} mb-6`}>
        <h2 className="font-semibold text-ink mb-4">
          สินค้าใกล้หมด
          <span className="ml-2 text-xs font-normal text-slate">(stock ≤ 10 ชิ้น)</span>
        </h2>
        {lowStock.length === 0 ? (
          <p className="text-sm text-crypto-green text-center py-4">สินค้าทุกรายการมีสต็อกเพียงพอ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate border-b border-ui-border">
                  <th className="pb-2 font-semibold">ชื่อสินค้า</th>
                  <th className="pb-2 font-semibold">หมวดหมู่</th>
                  <th className="pb-2 font-semibold text-right">คงเหลือ</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p.id} className="border-b border-ui-border last:border-0">
                    <td className="py-2 text-ink">{p.name}</td>
                    <td className="py-2 text-slate">{p.category}</td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.stock_qty === 0
                          ? 'bg-crypto-red/10 text-crypto-red'
                          : p.stock_qty <= 3
                          ? 'bg-brand/10 text-brand-dark'
                          : 'bg-brand/10 text-brand-dark'
                      }`}>
                        {p.stock_qty === 0 ? 'หมดแล้ว' : `${p.stock_qty} ชิ้น`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className={`${cardCls} mb-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-ink">ออเดอร์ล่าสุด</h2>
          <Link to="/admin/orders" className="text-sm text-brand font-semibold hover:text-brand-dark transition-colors duration-200">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="space-y-1">
          {data.recent_orders.map(order => {
            const s = STATUS_LABEL[order.status] || { label: order.status, color: 'bg-snow text-slate' };
            return (
              <Link
                key={order.id}
                to="/admin/orders"
                className="flex justify-between items-center py-2 border-b border-ui-border last:border-0 hover:bg-snow rounded-[8px] px-2 transition-colors duration-200"
              >
                <div>
                  <span className="text-sm font-semibold text-ink">#{order.id}</span>
                  <span className="text-sm text-slate ml-2">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.color}`}>{s.label}</span>
                  <span className="text-sm font-bold text-brand tabular-nums">฿{Number(order.total_price).toLocaleString()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick nav */}
      <div className="flex gap-4">
        {[
          { to: '/admin/products',   label: 'จัดการสินค้า' },
          { to: '/admin/orders',     label: 'จัดการออเดอร์' },
          { to: '/admin/categories', label: 'จัดการหมวดหมู่' },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="flex-1 bg-brand text-ink rounded-[12px] p-4 text-center font-semibold hover:bg-brand-hover hover:text-white transition-colors duration-200"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
