const pool = require('../config/db');

// POST /api/orders — สร้างออเดอร์จากตะกร้า
const createOrder = async (req, res) => {
  const { shipping_address_id } = req.body;

  if (!shipping_address_id) {
    return res.status(400).json({ message: 'กรุณาเลือกที่อยู่จัดส่ง' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ตรวจสอบที่อยู่เป็นของ user คนนี้
    const addrCheck = await client.query(
      'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
      [shipping_address_id, req.user.id]
    );
    if (addrCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'ที่อยู่จัดส่งไม่ถูกต้อง' });
    }

    // ดึงรายการในตะกร้า
    const cartResult = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock_qty, p.name
       FROM carts ca
       JOIN cart_items ci ON ci.cart_id = ca.id
       JOIN products p ON ci.product_id = p.id
       WHERE ca.user_id = $1`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'ตะกร้าสินค้าว่างเปล่า' });
    }

    // ตรวจสอบสต็อกทุกรายการ
    for (const item of cartResult.rows) {
      if (item.stock_qty < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `สินค้า "${item.name}" มีสต็อกไม่เพียงพอ` });
      }
    }

    // สร้าง order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, shipping_address_id, status)
       VALUES ($1, $2, 'pending') RETURNING id`,
      [req.user.id, shipping_address_id]
    );
    const orderId = orderResult.rows[0].id;

    // บันทึก order_items และลด stock
    for (const item of cartResult.rows) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      await client.query(
        'UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // ล้างตะกร้า
    await client.query(
      `DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)`,
      [req.user.id]
    );

    await client.query('COMMIT');

    res.status(201).json({ message: 'สร้างออเดอร์สำเร็จ', order_id: orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  } finally {
    client.release();
  }
};

// GET /api/orders — ประวัติออเดอร์ของ user
const getMyOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.status, o.created_at,
              SUM(oi.quantity * oi.unit_price) AS total_price
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// GET /api/orders/:id — รายละเอียดออเดอร์
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const orderResult = await pool.query(
      `SELECT o.*, a.recipient_name, a.street, a.sub_district, a.district, a.province, a.postal_code, a.phone AS shipping_phone
       FROM orders o
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.id = $1 AND (o.user_id = $2 OR $3 = 'admin')`,
      [id, req.user.id, req.user.role]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบออเดอร์' });
    }

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name AS product_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    const payment = await pool.query('SELECT * FROM payments WHERE order_id = $1', [id]);

    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows,
      payment: payment.rows[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };
