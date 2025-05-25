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
const logout = async (req, res,next) => {
    req.logout((err) => {
        if(err) { return next(err); }
        req.flash('success_msg', '你已經成功登出。')
        req.session.destroy((err) => {
            if(err) {
                console.error('Session destroy error:', err);
                return res.status(500).json({ message: '無法登出，請稍後再試' });
            }
        })

        // 清除 cookie data
        res.clearCookie('sessionId', {
            path:'/',
            httpOnly:true,
            sameSite:'strict',
            secure:false // deploy 要改成 true
        })
        
        return res.redirect('/users/login')
    });
}
// 登入
const loginUser = async(req, res, next) => {
    // 保存原本的 cartId, 防止 session 重新生成時丟失
    const originalCartId = req.session.cartId;

    passport.authenticate('local', async (err, user, info) => {
        try {
            // 處理驗證過程中的錯誤, server error
            if(err) {
                console.error('Authentication error:', err);
                req.flash('error_msg','登入過程發現錯誤，請稍後再試');
                return res.redirect('/users/login');
            }

            // 驗證失敗, 404
            if(!user) {
                req.flash(info.type, info.message);
                return res.redirect('/users/login');
            }

            // 驗證成功, 建立用戶 session
            req.logIn(user, async (loginError) => {
                if(loginError) {
                    console.error('Login session error:', loginError);
                    req.flash('error_msg', '登入過程發生錯誤，請稍後再試');
                    return res.redirect('/users/login');
                }

                try {
                    // 恢復 cartId
                    if(originalCartId) {
                        req.session.cartId = originalCartId;
                        console.log(req.session.cartId);
                    }

                    // 處理購物車合併

                    res.redirect('/');
                } catch (cartError) {
                    console.error('Cart merge error:', cartError);
                    // 即使購物車合併失敗，也讓用戶成功登入
                    req.flash('warning_msg', '登入成功, 但購物車合併發生問題');
                    req.redirect('/');
                }
            });
        } catch (error) {
            console.error('Login controller error:', error);
            req.flash('error_msg', '系統錯誤，請稍後再試');
            res.redirect('/users/login');
        }
    })(req, res, next); // 給 passport.authticate() 回傳函式需要用的參數
};

module.exports = {
    register,
    logout,
    getLoginPage,
    getRegisterPage,
    loginUser
}