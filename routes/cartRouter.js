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