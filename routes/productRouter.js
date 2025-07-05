const express = require("express");
const router = express.Router();
const productController = require('../controllers/productController');
const  upload = require('../middleware/multer');

// implement CRUD API
// get all product
router.get('/', productController.getProducts)
// get one product
router.get('/:productNumber', productController.getOneProduct)
// upload image
router.post('/uploadImage', upload, productController.uploadImage)

module.exports = router;