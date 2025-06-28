/**
 * @swagger
 * tags:
 *   name: Order
 *   description: 訂單與結帳相關 API
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
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET: checkout-personal-info page
/**
 * @swagger
 * /orders/personal-info:
 *   get:
 *     summary: 結帳第一步 - 顯示收件人/聯絡資訊頁面
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: 成功取得頁面（或表單資料）
 */
router.get('/personal-info', orderController.getCheckoutPage);
router.post('/personal-info', orderController.postPersonalInfo);

// POST: checkout-address page
/**
 * @swagger
 * /orders/address:
 *   post:
 *     summary: 結帳第二步 - 處理運送/付款方式選擇
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: 進入結帳步驟2（回傳下一步資料）
 */
router.get('/address', orderController.getCheckoutStep2);
router.post('/address', orderController.postCheckoutStep2);
// POST: checkout-payment page
/**
 * @swagger
 * /orders/payment:
 *   post:
 *     summary: 結帳第三步 - 確認訂單明細
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cart:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *     responses:
 *       200:
 *         description: 顯示訂單明細頁
 */
router.get('/payment', orderController.getCheckoutStep3);
router.post('/payment',orderController.postCheckoutStep3);

router.get('/confirmation', orderController.postCheckoutConfirmation);

// POST: checkout-success page
/**
 * @swagger
 * /orders/place-order:
 *   post:
 *     summary: 結帳完成 - 提交訂單
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderInfo:
 *                 $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: 訂單建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.post('/place-order', orderController.getCheckoutSuccess);
// GET: get order history
/**
 * @swagger
 * /orders/history:
 *   get:
 *     summary: 查詢訂單歷史紀錄
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: 回傳訂單歷史列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/history', orderController.getOrderhistory);
// GET: get order-detail for user
/**
 * @swagger
 * /orders/{orderNumber}:
 *   get:
 *     summary: 查詢單一訂單明細
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: 訂單編號
 *     responses:
 *       200:
 *         description: 單一訂單明細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: 找不到訂單
 */
router.get('/:orderNumber', orderController.getOrderDetail);

module.exports = router;