const express = require("express");
const router = express.Router();
const productController = require('../controllers/productController');

// implement CRUD API
// get all product
router.get('/', productController.getProducts)

// get one product
router.get('/:productNumber', productController.getOneProduct)

module.exports = router;