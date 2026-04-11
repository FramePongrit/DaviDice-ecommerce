const pool = require('../config/db');

// GET /api/addresses
const getAddresses = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id',
    [req.user.id]
  );
  res.json(result.rows);
};

// POST /api/addresses
const createAddress = async (req, res) => {
  const { recipient_name, phone, street, sub_district, district, province, postal_code, is_default = false } = req.body;
  if (!recipient_name || !street || !province || !postal_code) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่อยู่ให้ครบ' });
  }
  try {
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }
    const result = await pool.query(
      `INSERT INTO addresses (user_id, recipient_name, phone, street, sub_district, district, province, postal_code, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, recipient_name, phone, street, sub_district, district, province, postal_code, is_default]
    );
    res.status(201).json({ message: 'เพิ่มที่อยู่สำเร็จ', address: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

module.exports = { getAddresses, createAddress };
