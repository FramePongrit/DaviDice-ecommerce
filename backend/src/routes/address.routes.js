const express = require('express');
const { getAddresses, createAddress } = require('../controllers/address.controller');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();
router.use(authenticate);
router.get('/', getAddresses);
router.post('/', createAddress);

module.exports = router;
