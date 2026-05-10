const express = require('express');
const {
  getAllOrders, updateOrderStatus, getDashboard,
  getCategories, createCategory, deleteCategory,
  getTopProducts, getIncomeByMonth, getLowStock,
  updateProduct, getSalesByCategory, getCustomerStats,
  getAnalyticsOverview,
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

router.get('/analytics/top-products', getTopProducts);
router.get('/analytics/income', getIncomeByMonth);
router.get('/analytics/low-stock', getLowStock);
router.get('/analytics/sales-by-category', getSalesByCategory);
router.get('/analytics/customer-stats', getCustomerStats);
router.get('/analytics/overview', getAnalyticsOverview);

router.put('/products/:id', updateProduct);

module.exports = router;
