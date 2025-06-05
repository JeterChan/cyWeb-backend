// routes/admin.js
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: 後台管理員相關 API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         orderNumber:
 *           type: string
 *         companyName:
 *           type: string
 *         orderDate:
 *           type: string
 *         shippingAddress:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         name:
 *           type: string
 *         spec:
 *           type: string
 *         price:
 *           type: number
 *         quantity:
 *           type: integer
 *         subtotal:
 *           type: number
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */

const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authValidation');
const adminController = require('../controllers/adminController');

// 訂單列表頁
/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: 管理員取得訂單列表
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []  # 或寫 bearerAuth: [] 視你的驗證設計
 *     responses:
 *       200:
 *         description: 訂單列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: 未授權
 */
router.get('/orders', isAdmin, adminController.getAdminOrdersPage);

// 單筆訂單詳情頁
/**
 * @swagger
 * /admin/orders/{orderNumber}:
 *   get:
 *     summary: 管理員查詢單一訂單詳情
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: 訂單編號
 *     responses:
 *       200:
 *         description: 訂單詳情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到訂單
 */
router.get('/orders/:orderNumber', isAdmin, adminController.getOrderDetail);

// 刪除訂單
/**
 * @swagger
 * /admin/orders/{orderNumber}/status:
 *   post:
 *     summary: 管理員更新訂單狀態
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: 訂單編號
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: 訂單新狀態（如 paid, processing, completed, cancel）
 *     responses:
 *       200:
 *         description: 狀態更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: 狀態更新失敗
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到訂單
 */
router.post('/orders/:orderNumber/status',isAdmin, adminController.updateOrderStatus);

module.exports = router;
