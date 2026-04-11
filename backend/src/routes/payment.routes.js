const express = require('express');
const { processPayment } = require('../controllers/payment.controller');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.use(authenticate);
router.post('/', processPayment);

module.exports = router;
