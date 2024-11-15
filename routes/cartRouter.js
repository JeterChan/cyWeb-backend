const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// 商品加入購物車、產生cartId放入session
router.post('/', cartController.addProductToCart);
module.exports = router