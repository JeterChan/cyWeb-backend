const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const categoryController = require('../controllers/categoryController');

// getImage
router.get('/image/:productId',imageController.getImage);

// add category
router.post('/addCategory', categoryController.addNewCategory);

module.exports = router;