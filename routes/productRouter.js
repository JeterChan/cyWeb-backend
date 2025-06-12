/**
 * @swagger
 * tags:
 *   name: Product
 *   description: 商品相關 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         productNumber:
 *           type: string
 *         name:
 *           type: string
 *         basePrice:
 *           type: number
 *         quantity:
 *           type: integer
 *         description:
 *           type: string
 *         specification:
 *           type: string
 *         image:
 *           type: string
 *         subcategoryId:
 *           type: integer
 *         subcategory:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             category:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 */
const express = require("express");
const router = express.Router();
const productController = require('../controllers/productController');
const  upload = require('../middleware/multer');

// implement CRUD API
// get all product
/**
 * @swagger
 * /products:
 *   get:
 *     summary: 取得商品列表
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 商品分類的 slug
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 分頁數（預設 1）
 *     responses:
 *       200:
 *         description: 商品列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       400:
 *         description: 沒有找到符合條件的商品
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.get('/', productController.getProducts)

// get one product
/**
 * @swagger
 * /products/{productNumber}:
 *   get:
 *     summary: 取得單一商品
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: productNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品編號
 *     responses:
 *       200:
 *         description: 商品資訊
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: 找不到商品
 */
router.get('/:productNumber', productController.getOneProduct)

// get products edm
/**
 * @swagger
 * /products/catalog/{page}:
 *   get:
 *     summary: EDM 目錄分頁商品列表
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: string
 *           example: A
 *         description: EDM 目錄頁（如 A, B, C ...）
 *     responses:
 *       200:
 *         description: 目錄分頁商品列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: 找不到該分頁
 */

router.get('/catalog/:page', productController.getProductsEDM)

// upload image
/**
 * @swagger
 * /products/uploadImage:
 *   post:
 *     summary: 上傳商品圖片
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 上傳成功，回傳圖片網址
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: 圖片網址
 *       400:
 *         description: 上傳失敗
 */

router.post('/uploadImage', upload, productController.uploadImage)

module.exports = router;