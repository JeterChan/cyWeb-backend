const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// add category
router.post('/categories', categoryController.createCategory);
// add subcategory
router.post('/subcategories', categoryController.createSubcategory);
// get all category
router.get('/categories', categoryController.getAllCategory);
// get subcategories 
router.get('/subcategories/:categoryName', categoryController.getSubcategories);

module.exports = router;