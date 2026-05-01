const pool = require('../config/db');
const { validationResult } = require('express-validator');

// GET /api/products
const getProducts = async (req, res) => {
  const { keyword, category_id, min_price, max_price, sort, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  const sortMap = { name_asc: 'p.name ASC', price_asc: 'p.price ASC' };
  const orderBy = sortMap[sort] || 'p.created_at DESC';

  let conditions = [];
  let params = [];
  let idx = 1;

  if (keyword) {
    conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
    params.push(`%${keyword}%`);
    idx++;
  }
  if (category_id) {
    conditions.push(`p.category_id = $${idx}`);
    params.push(category_id);
    idx++;
  }
  if (min_price) {
    conditions.push(`p.price >= $${idx}`);
    params.push(min_price);
    idx++;
  }
  if (max_price) {
    conditions.push(`p.price <= $${idx}`);
    params.push(max_price);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products p ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock_qty,
              p.category_id, c.name AS category_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY ${orderBy}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      products: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }

    const images = await pool.query(
      'SELECT id, image_url, is_primary, sort_order FROM product_images WHERE product_id = $1 ORDER BY sort_order',
      [id]
    );

    res.json({ ...result.rows[0], images: images.rows });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// GET /api/products/bestsellers — top 5 by quantity sold
const getBestSellers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.price, p.stock_qty,
              c.name AS category_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url,
              CAST(SUM(oi.quantity) AS INTEGER) AS total_sold
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE o.status != 'cancelled'
       GROUP BY p.id, p.name, p.price, p.stock_qty, c.name
       ORDER BY total_sold DESC
       LIMIT 5`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// POST /api/products — Admin only
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, stock_qty, category_id, image_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock_qty, category_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, price, stock_qty, category_id]
    );

    const product = result.rows[0];

    if (image_url) {
      await pool.query(
        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES ($1, $2, true, 1)',
        [product.id, image_url]
      );
    }

    res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ', product });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// PUT /api/products/:id — Admin only
const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, description, price, stock_qty, category_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, stock_qty=$4, category_id=$5
       WHERE id=$6 RETURNING *`,
      [name, description, price, stock_qty, category_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }

    res.json({ message: 'อัปเดตสินค้าสำเร็จ', product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

// DELETE /api/products/:id — Admin only
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }
    res.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

module.exports = { getProducts, getProductById, getCategories, getBestSellers, createProduct, updateProduct, deleteProduct };
