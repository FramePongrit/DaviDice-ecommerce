const pool = require('../config/db');

const getDateRange = (query) => {
  const now = new Date();
  const defaultTo = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - 29);
  const defaultFrom = fromDate.toISOString().slice(0, 10);

  return {
    from: query.from || defaultFrom,
    to: query.to || defaultTo,
    granularity: query.granularity === 'monthly' ? 'monthly' : 'daily',
  };
};

// GET /api/admin/orders — ดูออเดอร์ทั้งหมด
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let conditions = [];
  let params = [];
  let idx = 1;

  if (status) {
    conditions.push(`o.status = $${idx}`);
    params.push(status);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT o.id, o.status, o.created_at,
              u.name AS customer_name, u.email AS customer_email,
              SUM(oi.quantity * oi.unit_price) AS total_price
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN order_items oi ON oi.order_id = o.id
       ${where}
       GROUP BY o.id, u.name, u.email
       ORDER BY o.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// PUT /api/admin/orders/:id/status — อัปเดตสถานะออเดอร์
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
  }

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบออเดอร์' });
    }
    res.json({ message: 'อัปเดตสถานะสำเร็จ', order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// GET /api/admin/dashboard — สรุปยอดขาย
const getDashboard = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, collectedRevenue, pendingRevenue, totalProducts, recentOrders] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM orders WHERE status != 'cancelled'`),
      pool.query(`SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
                  FROM order_items oi
                  JOIN orders o ON oi.order_id = o.id
                  WHERE o.status != 'cancelled'`),
      pool.query(`SELECT COALESCE(SUM(p.amount), 0) AS collected
                  FROM payments p
                  WHERE p.status = 'paid'`),
      pool.query(`SELECT COALESCE(SUM(p.amount), 0) AS pending
                  FROM payments p
                  WHERE p.status IN ('pending', 'failed')`),
      pool.query(`SELECT COUNT(*) FROM products`),
      pool.query(`SELECT o.id, o.status, o.created_at,
                         u.name AS customer_name,
                         SUM(oi.quantity * oi.unit_price) AS total_price
                  FROM orders o
                  JOIN users u ON o.user_id = u.id
                  JOIN order_items oi ON oi.order_id = o.id
                  WHERE o.status != 'cancelled'
                  GROUP BY o.id, u.name
                  ORDER BY o.created_at DESC
                  LIMIT 5`),
    ]);

    res.json({
      total_orders: parseInt(totalOrders.rows[0].count),
      total_revenue: parseFloat(totalRevenue.rows[0].revenue),
      collected_revenue: parseFloat(collectedRevenue.rows[0].collected),
      pending_revenue: parseFloat(pendingRevenue.rows[0].pending),
      total_products: parseInt(totalProducts.rows[0].count),
      recent_orders: recentOrders.rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// GET /api/admin/categories — ดูหมวดหมู่ทั้งหมด
const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// POST /api/admin/categories — เพิ่มหมวดหมู่
const createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'กรุณากรอกชื่อหมวดหมู่' });

  try {
    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json({ message: 'เพิ่มหมวดหมู่สำเร็จ', category: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// DELETE /api/admin/categories/:id — ลบหมวดหมู่
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบหมวดหมู่' });
    }
    res.json({ message: 'ลบหมวดหมู่สำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// GET /api/admin/analytics/top-products?month=YYYY-MM — สินค้าขายดีประจำเดือน
const getTopProducts = async (req, res) => {
  const { month } = req.query;
  const targetMonth = month || new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  try {
    const result = await pool.query(
      `SELECT p.name, SUM(oi.quantity) AS total_qty
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       WHERE o.status != 'cancelled'
         AND TO_CHAR(o.created_at, 'YYYY-MM') = $1
       GROUP BY p.name
       ORDER BY total_qty DESC
       LIMIT 5`,
      [targetMonth]
    );
    res.json({ month: targetMonth, products: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// GET /api/admin/analytics/income?from=YYYY-MM&to=YYYY-MM — รายได้รวมรายเดือน
const getIncomeByMonth = async (req, res) => {
  const now = new Date();
  const defaultTo   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const defaultFrom = `${now.getFullYear() - 1}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const from = req.query.from || defaultFrom;
  const to   = req.query.to   || defaultTo;

  try {
    const result = await pool.query(
      `SELECT TO_CHAR(o.created_at, 'YYYY-MM') AS month,
              SUM(oi.quantity * oi.unit_price) AS gross_income
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN payments py ON py.order_id = o.id
       WHERE o.status != 'cancelled'
         AND py.status = 'paid'
         AND TO_CHAR(o.created_at, 'YYYY-MM') >= $1
         AND TO_CHAR(o.created_at, 'YYYY-MM') <= $2
       GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
       ORDER BY month ASC`,
      [from, to]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// GET /api/admin/analytics/low-stock?threshold=10 — สินค้าใกล้หมด
const getLowStock = async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.stock_qty, c.name AS category
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.stock_qty <= $1
       ORDER BY p.stock_qty ASC`,
      [threshold]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// PUT /api/admin/products/:id — อัปเดตสต็อก
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { stock_qty, name, description, price } = req.body;

  try {
    let query = 'UPDATE products SET';
    let params = [];
    let idx = 1;
    const updates = [];

    if (stock_qty !== undefined) {
      updates.push(`stock_qty = $${idx}`);
      params.push(stock_qty);
      idx++;
    }
    if (name) {
      updates.push(`name = $${idx}`);
      params.push(name);
      idx++;
    }
    if (description) {
      updates.push(`description = $${idx}`);
      params.push(description);
      idx++;
    }
    if (price) {
      updates.push(`price = $${idx}`);
      params.push(price);
      idx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'ไม่มีข้อมูลให้อัปเดต' });
    }

    query += ' ' + updates.join(', ') + ` WHERE id = $${idx} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }

    console.log(`✅ Product ${id} updated: stock_qty=${stock_qty}`);
    res.json({ message: 'อัปเดตสินค้าสำเร็จ', product: result.rows[0] });
  } catch (err) {
    console.error(`❌ Update product error: ${err.message}`);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// GET /api/admin/analytics/sales-by-category — ยอดขายแบ่งตามหมวดหมู่
const getSalesByCategory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.name AS category, 
              SUM(oi.quantity) AS total_qty,
              SUM(oi.quantity * oi.unit_price) AS total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       JOIN categories c ON c.id = p.category_id
       WHERE o.status != 'cancelled'
       GROUP BY c.name
       ORDER BY total_revenue DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// GET /api/admin/analytics/customer-stats — สถิติลูกค้า
const getCustomerStats = async (req, res) => {
  try {
    const [totalCustomers, repeatCustomers] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT user_id) AS count FROM orders`),
      pool.query(
        `SELECT COUNT(user_id) AS count 
         FROM (
           SELECT user_id, COUNT(*) as order_count
           FROM orders
           WHERE status != 'cancelled'
           GROUP BY user_id
           HAVING COUNT(*) > 1
         ) AS repeat
        `
      ),
    ]);

    res.json({
      total_customers: parseInt(totalCustomers.rows[0].count),
      repeat_customers: parseInt(repeatCustomers.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// GET /api/admin/analytics/overview?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=daily|monthly
const getAnalyticsOverview = async (req, res) => {
  const { from, to, granularity } = getDateRange(req.query);
  const bucketExpr = granularity === 'monthly'
    ? "TO_CHAR(o.created_at, 'YYYY-MM')"
    : "TO_CHAR(o.created_at, 'YYYY-MM-DD')";

  try {
    const [
      summary,
      trend,
      statusBreakdown,
      topProducts,
      topCategories,
      inventory,
      customerStats,
    ] = await Promise.all([
      pool.query(
        `WITH order_totals AS (
           SELECT o.id, o.status, COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS order_total
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
           WHERE o.created_at::date BETWEEN $1::date AND $2::date
           GROUP BY o.id, o.status
         )
         SELECT
           COALESCE(SUM(CASE WHEN ot.status != 'cancelled' THEN ot.order_total ELSE 0 END), 0) AS revenue,
           COUNT(*) FILTER (WHERE ot.status != 'cancelled') AS orders,
           COUNT(*) FILTER (WHERE ot.status = 'cancelled') AS cancelled_orders,
           COALESCE(SUM(CASE WHEN py.status = 'paid' THEN py.amount ELSE 0 END), 0) AS collected_revenue,
           COALESCE(SUM(CASE WHEN py.status IN ('pending', 'failed') THEN py.amount ELSE 0 END), 0) AS pending_revenue
         FROM order_totals ot
         LEFT JOIN payments py ON py.order_id = ot.id`,
        [from, to]
      ),
      pool.query(
        `SELECT ${bucketExpr} AS bucket,
                COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.quantity * oi.unit_price ELSE 0 END), 0) AS revenue,
                COUNT(DISTINCT CASE WHEN o.status != 'cancelled' THEN o.id END) AS orders
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.created_at::date BETWEEN $1::date AND $2::date
         GROUP BY bucket
         ORDER BY bucket ASC`,
        [from, to]
      ),
      pool.query(
        `SELECT status, COUNT(*) AS count
         FROM orders
         WHERE created_at::date BETWEEN $1::date AND $2::date
         GROUP BY status
         ORDER BY count DESC`,
        [from, to]
      ),
      pool.query(
        `SELECT p.id, p.name, c.name AS category,
                SUM(oi.quantity) AS total_qty,
                SUM(oi.quantity * oi.unit_price) AS revenue,
                MAX(p.stock_qty) AS stock_qty
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         JOIN products p ON p.id = oi.product_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE o.status != 'cancelled'
           AND o.created_at::date BETWEEN $1::date AND $2::date
         GROUP BY p.id, p.name, c.name
         ORDER BY revenue DESC
         LIMIT 8`,
        [from, to]
      ),
      pool.query(
        `SELECT c.name AS category,
                SUM(oi.quantity) AS total_qty,
                SUM(oi.quantity * oi.unit_price) AS revenue
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         JOIN products p ON p.id = oi.product_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE o.status != 'cancelled'
           AND o.created_at::date BETWEEN $1::date AND $2::date
         GROUP BY c.name
         ORDER BY revenue DESC
         LIMIT 8`,
        [from, to]
      ),
      pool.query(
        `SELECT
           COUNT(*) AS total_products,
           COALESCE(SUM(stock_qty), 0) AS total_stock,
           COUNT(*) FILTER (WHERE stock_qty > 0 AND stock_qty <= 10) AS low_stock,
           COUNT(*) FILTER (WHERE stock_qty = 0) AS out_of_stock,
           COALESCE(SUM(price * stock_qty), 0) AS stock_value,
           COUNT(*) FILTER (
             WHERE stock_qty > 0
               AND NOT EXISTS (
                 SELECT 1
                 FROM order_items oi
                 JOIN orders o ON o.id = oi.order_id
                 WHERE oi.product_id = products.id
                   AND o.status != 'cancelled'
                   AND o.created_at::date BETWEEN $1::date AND $2::date
               )
           ) AS unsold_stock
         FROM products`,
        [from, to]
      ),
      pool.query(
        `SELECT
           COUNT(DISTINCT user_id) AS active_customers,
           COUNT(DISTINCT user_id) FILTER (
             WHERE user_id IN (
               SELECT user_id
               FROM orders
               WHERE status != 'cancelled'
               GROUP BY user_id
               HAVING COUNT(*) > 1
             )
           ) AS repeat_customers
         FROM orders
         WHERE status != 'cancelled'
           AND created_at::date BETWEEN $1::date AND $2::date`,
        [from, to]
      ),
    ]);

    const summaryRow = summary.rows[0] || {};
    const orders = Number(summaryRow.orders || 0);
    const revenue = Number(summaryRow.revenue || 0);

    res.json({
      filters: { from, to, granularity },
      summary: {
        revenue,
        orders,
        average_order_value: orders ? revenue / orders : 0,
        cancelled_orders: Number(summaryRow.cancelled_orders || 0),
        collected_revenue: Number(summaryRow.collected_revenue || 0),
        pending_revenue: Number(summaryRow.pending_revenue || 0),
      },
      trend: trend.rows,
      status_breakdown: statusBreakdown.rows,
      top_products: topProducts.rows,
      top_categories: topCategories.rows,
      inventory: inventory.rows[0] || {},
      customers: customerStats.rows[0] || {},
    });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

module.exports = {
  getAllOrders, updateOrderStatus, getDashboard,
  getCategories, createCategory, deleteCategory,
  getTopProducts, getIncomeByMonth, getLowStock,
  updateProduct, getSalesByCategory, getCustomerStats,
  getAnalyticsOverview,
};
