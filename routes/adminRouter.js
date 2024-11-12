const express = require("express");
const router = express.Router();
const productController = require('../controllers/productController');

// for admin api
// 新增商品
router.post('/products', productController.createNewProduct);
//更新商品
router.patch('/products/:productNumber',productController.updateProduct);
//刪除商品
router.delete('/products/:productNumber',productController.deleteProduct);

module.exports = router;