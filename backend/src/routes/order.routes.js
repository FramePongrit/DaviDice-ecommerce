const express = require('express');
const { createOrder, getMyOrders, getOrderById, markOrderAsReceived } = require('../controllers/order.controller');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id/received', markOrderAsReceived);

module.exports = router;
