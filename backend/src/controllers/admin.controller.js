const pool = require('../config/db');

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
    const [totalOrders, totalRevenue, totalProducts, recentOrders] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM orders`),
      pool.query(`SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
                  FROM payments p JOIN order_items oi ON oi.order_id = p.order_id
                  WHERE p.status = 'paid'`),
      pool.query(`SELECT COUNT(*) FROM products`),
      pool.query(`SELECT o.id, o.status, o.created_at,
                         u.name AS customer_name,
                         SUM(oi.quantity * oi.unit_price) AS total_price
                  FROM orders o
                  JOIN users u ON o.user_id = u.id
                  JOIN order_items oi ON oi.order_id = o.id
                  GROUP BY o.id, u.name
                  ORDER BY o.created_at DESC
                  LIMIT 5`),
    ]);

    res.json({
      total_orders: parseInt(totalOrders.rows[0].count),
      total_revenue: parseFloat(totalRevenue.rows[0].revenue),
      total_products: parseInt(totalProducts.rows[0].count),
      recent_orders: recentOrders.rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
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
      `SELECT TO_CHAR(py.paid_at, 'YYYY-MM') AS month,
              SUM(oi.quantity * oi.unit_price) AS gross_income
       FROM payments py
       JOIN order_items oi ON oi.order_id = py.order_id
       WHERE py.status = 'paid'
         AND TO_CHAR(py.paid_at, 'YYYY-MM') >= $1
         AND TO_CHAR(py.paid_at, 'YYYY-MM') <= $2
       GROUP BY TO_CHAR(py.paid_at, 'YYYY-MM')
       ORDER BY month ASC`,
      [from, to]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
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

module.exports = {
  getAllOrders, updateOrderStatus, getDashboard,
  getCategories, createCategory, deleteCategory,
  getTopProducts, getIncomeByMonth, getLowStock,
};
