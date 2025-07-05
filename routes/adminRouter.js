// routes/admin.js
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: 後台管理員相關 API
 */
/**
 * @swagger
 * /admin/updateStatus:
 *   get:
 *     summary: 獲取訂單狀態統計
 *     tags: [Admin]
 *     description: |
 *       獲取各種訂單狀態的數量統計，用於後台儀表板顯示。
 *       需要管理員權限才能存取。
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取訂單狀態統計
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderStatusResponse'
 *             example:
 *               totalOrdersCount: 150
 *               processingCount: 25
 *               deliveredCount: 80
 *               completedCount: 40
 *               cancelCount: 5
 *       401:
 *         description: 未授權或非管理員
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "需要管理員權限"
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "獲取訂單統計失敗"
 */

/**
 * @swagger
 * /admin/orders/{orderNumber}/status:
 *   post:
 *     summary: 更新訂單狀態
 *     tags: [Admin]
 *     description: |
 *       更新指定訂單的狀態。管理員可以將訂單狀態更改為：
 *       - pending（待處理）
 *       - processing（處理中）
 *       - delivered（已送達）
 *       - completed（已完成）
 *       - cancel（已取消）
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: 訂單編號
 *         example: "ORD-2024-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *           example:
 *             status: "delivered"
 *     responses:
 *       200:
 *         description: 訂單狀態更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSuccessResponse'
 *             example:
 *               success: true
 *               message: "Order update successfully"
 *       400:
 *         description: 無效的訂單狀態
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "無效的訂單狀態"
 *       401:
 *         description: 未授權或非管理員
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "需要管理員權限"
 *       404:
 *         description: 找不到指定的訂單
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "404 頁面"
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "資料庫連接失敗"
 */

const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authValidation');
const adminController = require('../controllers/adminController');

// 訂單列表頁
router.get('/orders', isAdmin, adminController.getAdminOrdersPage);
router.get('/updateStatus', isAdmin, adminController.getOrdersStatus);
// 單筆訂單詳情頁
router.get('/orders/:orderNumber', isAdmin, adminController.getOrderDetail);
// 刪除訂單
router.post('/orders/:orderNumber/status',isAdmin, adminController.updateOrderStatus);

module.exports = router;
