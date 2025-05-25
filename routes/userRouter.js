const express = require('express');
const router = express.Router();
const { registerValidation,ensureAuthenticated,ensureGuest } = require('../middleware/authValidation');
const userController = require('../controllers/userController');

// 顯示登入頁面
router.get('/login', ensureGuest, userController.getLoginPage)
// 登入 POST 路由
router.post('/login', ensureGuest, userController.loginUser)
// 顯示註冊頁面
router.get('/register', ensureGuest, userController.getRegisterPage)
// 處理註冊請求
router.post('/register', ensureGuest, registerValidation, userController.register)

// 處理登出請求
router.post('/logout', ensureAuthenticated, userController.logout);

module.exports = router;