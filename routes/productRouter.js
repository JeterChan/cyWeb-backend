const express = require("express");
const router = express.Router();
const productController = require('../controllers/productController');
const fs = require('fs');

const multer = require('multer');
const path = require('path');

// 設定 multer 的儲存配置
const storage = multer.memoryStorage();

// config multer
const upload = multer({

    fileFilter(req, file , cb) {
        // 只接受三種圖片格式
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.jpg' && ext !== '.png' && ext != '.jpeg') {
            // 拒絕檔案
            cb(new Error('檔案格式錯誤,僅接受 jpg, png, jpeg 格式。'));
        }

        // 接受檔案
        cb(null, true);
    }
});

// implement CRUD API

// get all product
router.get('/', productController.getProductPage)

// get one product
router.get('/:product_id', productController.getOneProduct)

// create product
router.post('/', productController.createProduct)

// update product
router.patch('/:_id', productController.updateProduct)

// delete product
router.delete('/:_id', productController.deleteProduct)

//upload image
router.post('/upload', upload.array('image',100), productController.uploadImage)

// read images
// router.get('/readImages/:_id', productController.readImage)

module.exports = router;