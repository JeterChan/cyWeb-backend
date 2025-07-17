/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: 購物車相關 API
 */
/**
 * @swagger
 * /cart:
 *   post:
 *     summary: 加入商品到購物車
 *     tags: [Cart]
 *     description: |
 *       將商品加入購物車。支援訪客（Session）和已登入用戶（資料庫）兩種模式。
 *       - 訪客：商品存儲在 Session 中
 *       - 已登入用戶：同時更新 Session 和資料庫
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *           example:
 *             productNumber: "P12345"
 *             quantity: 2
 *     responses:
 *       200:
 *         description: 商品成功加入購物車
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *             example:
 *               success: true
 *               message: "Product added to cart successfully"
 *               cart: [
 *                 {
 *                   productId: 1,
 *                   productNumber: "P12345",
 *                   spec: "6.7吋 Super Retina XDR 顯示器, 256GB",
 *                   name: "iPhone 15 Pro Max",
 *                   price: 45900,
 *                   quantity: 2,
 *                   subtotal: 91800
 *                 }
 *               ]
 *               cartItemCount: 1
 *               totalItemCount: 2
 *       404:
 *         description: 找不到指定的商品
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Product not found"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /cart/update:
 *   patch:
 *     summary: 更新購物車商品數量
 *     tags: [Cart]
 *     description: |
 *       更新購物車中特定商品的數量。
 *       - 當數量為 0 時，建議前端詢問用戶是否刪除該商品
 *       - 支援訪客和已登入用戶模式
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartRequest'
 *           example:
 *             productId: 1
 *             quantity: 3
 *     responses:
 *       200:
 *         description: 購物車更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *             example:
 *               success: true
 *               message: "Update cart Item successfully"
 *               cart: [
 *                 {
 *                   productId: 1,
 *                   productNumber: "P12345",
 *                   spec: "6.7吋 Super Retina XDR 顯示器, 256GB",
 *                   name: "iPhone 15 Pro Max",
 *                   price: 45900,
 *                   quantity: 3,
 *                   subtotal: 137700
 *                 }
 *               ]
 *               cartItemCount: 1
 *               totalItemCount: 3
 *       404:
 *         description: 找不到指定的商品
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Can not find the product"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /cart/remove:
 *   delete:
 *     summary: 刪除購物車中的商品
 *     tags: [Cart]
 *     description: |
 *       從購物車中完全移除指定的商品。
 *       - 支援訪客和已登入用戶模式
 *       - 已登入用戶會同時從資料庫中刪除
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveFromCartRequest'
 *           example:
 *             productId: 1
 *     responses:
 *       200:
 *         description: 商品成功從購物車中移除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemoveCartResponse'
 *             example:
 *               success: true
 *               message: "Delete the product successfully!"
 *               cartItemCount: 0
 *       404:
 *         description: 找不到用戶購物車（僅限已登入用戶）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Can not find the user cart! Please login first"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: 清空購物車
 *     tags: [Cart]
 *     description: |
 *       清空購物車中的所有商品。
 *       - 訪客：清空 Session 中的購物車
 *       - 已登入用戶：同時清空 Session 和資料庫
 *     responses:
 *       200:
 *         description: 購物車清空成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClearCartResponse'
 *             example:
 *               success: true
 *       404:
 *         description: 找不到購物車（僅限已登入用戶）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "There is no cart"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// 商品加入購物車、產生cartId放入session

router.post('/', cartController.addProductToCart);
// 更新購物車

router.patch('/update', cartController.updateCart);
// 刪除購物車商品

router.delete('/remove', cartController.deleteCartItem);
// 清空購物車商品

router.delete('/clear', cartController.clearCart);
module.exports = router