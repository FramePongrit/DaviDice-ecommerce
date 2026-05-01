const express = require('express');
const { body } = require('express-validator');
const {
  getProducts, getProductById, getCategories, getBestSellers,
  createProduct, updateProduct, deleteProduct,
} = require('../controllers/product.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeAdmin = require('../middlewares/authorizeAdmin');

const router = express.Router();

const productValidation = [
  body('name').notEmpty().withMessage('กรุณากรอกชื่อสินค้า'),
  body('price').isFloat({ min: 0 }).withMessage('ราคาต้องเป็นตัวเลขที่มากกว่า 0'),
  body('stock_qty').isInt({ min: 0 }).withMessage('จำนวนสต็อกต้องเป็นตัวเลขที่ไม่ติดลบ'),
  body('category_id').isInt().withMessage('กรุณาเลือกหมวดหมู่'),
];

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/bestsellers', getBestSellers);
router.get('/:id', getProductById);
router.post('/', authenticate, authorizeAdmin, productValidation, createProduct);
router.put('/:id', authenticate, authorizeAdmin, productValidation, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

module.exports = router;
