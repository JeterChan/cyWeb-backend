const { User } = require('../db/models');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const passport = require('passport');
const { v4:uuidv4 } = require('uuid');

// get login page
const getLoginPage = async (req, res) => {
    res.render('login')
}

//get register page
const getRegisterPage = async (req, res) => {
    res.render('register', {oldInput:null})
}

// 註冊邏輯
const register = async (req, res) => {
    // 檢查驗證結果
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.locals.errors = errors.array();
            console.log(errors.array());
            return res.render('register',{
                oldInput: {
                    email: req.body.email,
                }
            });
        }

        const { email, password } = req.body;

        // 檢查 email 是否已存在
        const existingUser = await User.findOne({
            where: {email}
        });

        if (existingUser) {
            return res.render('register' , {
                errors: [{
                    msg: '此電子郵件已被註冊'
                }],
                oldInput: {
                    email:email,
                    errors
                }
            });
        }

        // 密碼加密
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 創建新用戶
        await User.create({
            id:uuidv4(),
            email:email,
            password:hashedPassword
        });

        // 註冊成功，轉到登入頁面
        // 快閃訊息需要 express-session
        req.flash('success_msg','註冊成功! 請登入');
        res.redirect('login');
    } catch(error) {
        console.log('註冊錯誤', error);
        res.render('register', {
            errors:[{
                msg:'註冊過程中發生錯誤, 請稍後再試'
            }],
            oldInput: {
                email: req.body.email
            }
        });
    }
}
// 登出
const logout = async (req, res) => {
    req.logout((err) => {
        if(err) { return next(err); }
        req.flash('success_msg', '你已經成功登出。')
        res.redirect('/users/login')
    });
}

module.exports = {
    register,
    logout,
    getLoginPage,
    getRegisterPage
}