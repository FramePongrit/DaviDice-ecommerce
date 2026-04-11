const pool = require('../config/db');

const getOrCreateCart = async (userId) => {
  let result = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    result = await pool.query(
      'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
      [userId]
    );
  }
  return result.rows[0].id;
};

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);

    const result = await pool.query(
      `SELECT ci.id, ci.quantity,
              p.id AS product_id, p.name, p.price, p.stock_qty,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url,
              (ci.quantity * p.price) AS subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    const total = result.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({ items: result.rows, total });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// POST /api/cart — เพิ่มสินค้าลงตะกร้า
const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id || quantity < 1) {
    return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง' });
  }

  try {
    const product = await pool.query('SELECT id, stock_qty FROM products WHERE id = $1', [product_id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }
    if (product.rows[0].stock_qty < quantity) {
      return res.status(400).json({ message: 'สินค้าในสต็อกไม่เพียงพอ' });
    }

    const cartId = await getOrCreateCart(req.user.id);

    const existing = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, product_id]
    );

    if (existing.rows.length > 0) {
      const newQty = existing.rows[0].quantity + quantity;
      if (product.rows[0].stock_qty < newQty) {
        return res.status(400).json({ message: 'สินค้าในสต็อกไม่เพียงพอ' });
      }
      await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQty, existing.rows[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, product_id, quantity]
      );
    }

    res.json({ message: 'เพิ่มสินค้าลงตะกร้าสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// PUT /api/cart/:itemId — แก้ไขจำนวน
const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'จำนวนต้องมากกว่า 0' });
  }

  try {
    const cartId = await getOrCreateCart(req.user.id);
    const item = await pool.query(
      'SELECT ci.id, p.stock_qty FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = $1 AND ci.cart_id = $2',
      [itemId, cartId]
    );

    if (item.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้าในตะกร้า' });
    }
    if (item.rows[0].stock_qty < quantity) {
      return res.status(400).json({ message: 'สินค้าในสต็อกไม่เพียงพอ' });
    }

    await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, itemId]);
    res.json({ message: 'อัปเดตจำนวนสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// DELETE /api/cart/:itemId — ลบสินค้าออกจากตะกร้า
const removeCartItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const cartId = await getOrCreateCart(req.user.id);
    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id',
      [itemId, cartId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้าในตะกร้า' });
    }
    res.json({ message: 'ลบสินค้าออกจากตะกร้าสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// DELETE /api/cart — ล้างตะกร้าทั้งหมด
const clearCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    res.json({ message: 'ล้างตะกร้าสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
