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