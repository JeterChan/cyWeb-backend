const express = require('express');
const router = express.Router();
const { registerValidation } = require('../middleware/authValidation');
const userController = require('../controllers/userController');
const passport = require('passport');

// 登入頁面路由
router.get('/login', userController.getLoginPage)
// 登入 POST 路由
router.post('/login', passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash:true
}))
// 註冊頁面路由
router.get('/register', userController.getRegisterPage)
// 處理註冊請求
router.post('/register', registerValidation, userController.register)

// 登出路由
router.get('/logout', userController.logout);

module.exports = router;