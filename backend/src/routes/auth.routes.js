const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('กรุณากรอกชื่อ'),
    body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง'),
    body('password').isLength({ min: 6 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง'),
    body('password').notEmpty().withMessage('กรุณากรอกรหัสผ่าน'),
  ],
  login
);

router.get('/me', authenticate, getMe);
router.put(
  '/me',
  authenticate,
  [body('name').notEmpty().withMessage('กรุณากรอกชื่อ')],
  updateProfile
);

module.exports = router;
