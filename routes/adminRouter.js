// routes/admin.js
const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authValidation');
const adminController = require('../controllers/adminController');

// 訂單列表頁
router.get('/orders', isAdmin, adminController.getAdminOrdersPage);

// 單筆訂單詳情頁
router.get('/orders/:orderNumber', isAdmin, adminController.getOrderDetail);

// 刪除訂單
router.post('/orders/:orderNumber/status',isAdmin, adminController.updateOrderStatus);

module.exports = router;
