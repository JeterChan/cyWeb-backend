const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const productController = require('../controllers/productController');
const Product = require('../models/productModel');

// implement CRUD API

// get all product
router.get('/', productController.getAllProducts)

// get one product
router.get('/:_id', productController.getOneProduct)

// create product
router.post('/', productController.createProduct)

// update product
router.patch('/:_id', productController.updateProduct)

// delete product
router.delete('/:_id', productController.deleteProduct)

module.exports = router;