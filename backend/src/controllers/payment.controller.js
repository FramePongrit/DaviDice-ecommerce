const pool = require('../config/db');

// POST /api/payments — Mock payment
const processPayment = async (req, res) => {
  const { order_id, method = 'mock' } = req.body;

  if (!order_id) {
    return res.status(400).json({ message: 'กรุณาระบุ order_id' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ตรวจสอบออเดอร์เป็นของ user และยังไม่ได้ชำระ
    const orderResult = await client.query(
      `SELECT o.id, o.status, SUM(oi.quantity * oi.unit_price) AS total
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [order_id, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'ไม่พบออเดอร์' });
    }

    const order = orderResult.rows[0];
    if (order.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'ออเดอร์นี้ชำระเงินไปแล้ว' });
    }

    // ตรวจสอบว่ายังไม่มี payment
    const existingPayment = await client.query(
      'SELECT id FROM payments WHERE order_id = $1',
      [order_id]
    );
    if (existingPayment.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'ออเดอร์นี้มีการชำระเงินแล้ว' });
    }

    // บันทึก payment
    const paymentResult = await client.query(
      `INSERT INTO payments (order_id, amount, method, status, paid_at)
       VALUES ($1, $2, $3, 'paid', NOW()) RETURNING *`,
      [order_id, order.total, method]
    );

    // อัปเดตสถานะออเดอร์เป็น processing
    await client.query(
      `UPDATE orders SET status = 'processing' WHERE id = $1`,
      [order_id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'ชำระเงินสำเร็จ',
      payment: paymentResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { processPayment };
