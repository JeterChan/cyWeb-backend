/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: 購物車相關 API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalAmount:
 *           type: number
 *         cartId:
 *           type: string
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         quantity:
 *           type: integer
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// 商品加入購物車、產生cartId放入session
/**
 * @swagger
 * /cart:
 *   post:
 *     summary: 商品加入購物車（同時產生 cartId 放入 session）
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 商品已加入購物車
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.post('/', cartController.addProductToCart);
// 更新購物車
/**
 * @swagger
 * /cart/update:
 *   patch:
 *     summary: 更新購物車內容（數量變更）
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 購物車更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.patch('/update', cartController.updateCart);
// 刪除購物車商品
/**
 * @swagger
 * /cart/remove:
 *   delete:
 *     summary: 刪除購物車商品
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 商品已移除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.delete('/remove', cartController.deleteCartItem);
// 清空購物車商品
/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: 清空購物車
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: 購物車已清空
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.delete('/clear', cartController.clearCart);
module.exports = router