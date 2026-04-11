const express = require('express');
const {
  getAllOrders, updateOrderStatus, getDashboard,
  getCategories, createCategory, deleteCategory,
} = require('../controllers/admin.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeAdmin = require('../middlewares/authorizeAdmin');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.get('/dashboard', getDashboard);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
