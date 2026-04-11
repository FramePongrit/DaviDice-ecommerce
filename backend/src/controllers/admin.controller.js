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

module.exports = { getAllOrders, updateOrderStatus, getDashboard, getCategories, createCategory, deleteCategory };
