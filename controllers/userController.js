const { User, Cart, CartItem,Product } = require('../db/models');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const passport = require('passport');
const { v4:uuidv4 } = require('uuid');
const crypto = require('crypto');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/mailer');
const { token } = require('morgan');

// get login page
const getLoginPage = async (req, res) => {
    res.render('users/login')
}

//get register page
const getRegisterPage = async (req, res) => {
    res.render('users/register', {oldInput:null})
}

// 註冊邏輯
const register = async (req, res) => {
    // 檢查驗證結果
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.locals.errors = errors.array();
            console.log(errors.array());
            return res.render('users/register',{
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
        // 已被驗證過, 跳轉到 login 頁面, 並顯示 req.flash
        if(existingUser && existingUser.isVerified) {
            req.flash('success_msg', '您的帳號已經驗證過了，請直接登入');
            return res.redirect('/users/login');
        } else if(existingUser && !existingUser.isVerified) {
            // 如果 email 已存在但未驗證，重新寄送驗證信
            // 顯示 req.flash
            req.flash('info_msg', '您的帳號尚未驗證，請檢查您的電子郵件以重新寄送驗證信');
            return res.redirect('/users/verify-expired');
        }
        if (existingUser) {
            return res.render('users/register' , {
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
        // 產生 token
        const token = crypto.randomBytes(32).toString('hex');
        // 產生 token_expires_at
        const now = new Date();
        // 設定 1 小時候過期
        const expires = new Date(now.getTime() + 1*60*60*1000);
        // 創建新用戶
        await User.create({
            id:uuidv4(),
            email:email,
            password:hashedPassword,
            isVerified:false,
            verification_token:token,
            token_expires_at:expires
        });
        // 寄送會員註冊驗證信
        await sendVerificationEmail(email,token);

        // 註冊成功，轉到登入頁面
        // 快閃訊息需要 express-session
        req.flash('success_msg','註冊成功! 請至信箱確認驗證信');
        res.render('users/register-success', {
            email: email
        });
    } catch(error) {
        console.log('註冊錯誤', error);
        res.render('users/register', {
            errors:[{
                msg:'註冊過程中發生錯誤, 請稍後再試'
            }],
            oldInput: {
                email: req.body.email
            }
        });
    }
}

// 驗證 token
const verifyToken = async(req, res) => {
    try {
        const { token } = req.params;
        // 1. 用該 token 去資料庫找user data
        const user = await User.findOne({ where:{ verification_token:token}});
        if(!user) {
            // 沒找到 user
            res.status(404).render('404');
        }
        // 2. verify token 時間
        const now = new Date();
        console.log('驗證 token 時間:', now);
        console.log('驗證 token 過期時間:', user.token_expires_at);
        if(!user.isVerified && user.token_expires_at < now) {
            // 超過一小時沒有點擊連結
            // 跳轉到驗證過期的頁面跳轉到驗證過期的頁面
            return res.redirect('/users/verify-expired');
        }
        // 已經驗證過又點擊連結
        if(user.isVerified) {
            req.flash('success_msg', '您的帳號已經驗證過了，請直接登入');
            console.log(`Path: ${req.path}`);
            // console.log(`Success messages:`, successMsg);
            // console.log(`Warning messages:`, warningMsg);
            return res.redirect('/users/login');
        }

        // 沒有逾時
        // 將 user.isVerified = true
        // 跳轉到 login page
        user.isVerified = true;
        await user.save();
        req.flash('success_msg', '您的帳號已成功驗證，請登入');
        res.redirect('/users/login')
        
    } catch (error) {
        console.log('驗證錯誤');
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// resned verification token
const resendVerificationToken = async(req, res) => {
    try {
        const { email } = req.body;
        // 建立新的 token
        const token = crypto.randomBytes(32).toString('hex');
        const now = new Date();
        const token_expires_at = new Date(now.getTime() + 1*60*60*1000);
        // 更新 token, 也需要更新資料庫
        const user = await User.findOne({ where: { email } });
        if(!user) {
            // 如果沒有找到 user, 則顯示錯誤訊息
            req.flash('error_msg', '找不到該電子郵件的用戶');
            return res.redirect('/users/verify-expired');
        };
        // 檢查用戶是否已經驗證過
        if(user.isVerified) {
            req.flash('success_msg', '您的帳號已經驗證過了，請直接登入');
            return res.redirect('/users/login');
        }
        // 更新用戶的驗證 token 和過期時間
        user.verification_token = token;
        user.token_expires_at = token_expires_at;
        // 儲存user資料
        await user.save();
        // 寄送驗證信
        // 取得用戶的 email
        // 重新寄驗證信給用戶
        await sendVerificationEmail(email, token);
        req.flash('success_msg', '驗證信已重新寄送，請檢查您的電子郵件');
        return res.redirect('/users/verify-expired'); // 返回原頁面

    } catch (error) {
        // 處理錯誤
        console.error('重新寄送驗證信錯誤:', error);
        req.flash('error_msg', '重新寄送驗證信失敗，請稍後再試');
        return res.redirect('/users/verify-expired'); // 返回原頁面顯示錯誤
    }
}

// 登出
const logout = async (req, res,next) => {
    req.logout((err) => {
        if(err) { return next(err); }
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
    const originalCartId = req.session.cart;

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
                    // 有以 guest 身分添加商品至購物車
                    // 恢復 cartId
                    if(originalCartId) {
                        req.session.cart = originalCartId;
                        console.log('----------------req.session.cart------------------');
                        console.log(req.session.cart);
                        // 處理購物車合併
                        const [ existingCart, created ] = await Cart.findOrCreate({ 
                            where: { userId: user.id }, 
                            defaults: { status: 'user' }
                        });
                        // 如果user已經有購物車, 將 res.session.cart 裡面的data儲存進 existingCart
                        if(!created) {
                            // 將 req.session.cart 中的商品創建 cartItem, 指定 cartId = existingCart.id
                            for(const item of req.session.cart) {
                                // 檢查購物車內有沒有與 req.session.cart 內一樣的商品
                                // 若沒有則直接創建新的 cartItem
                                const [ cartItem, created ] = await CartItem.findOrCreate({
                                    where:{ 
                                        cartId: existingCart.id,
                                        productId:item.productId
                                    },
                                    defaults:{
                                        quantity: item.quantity
                                    }
                                });
                                // 如果不是新創立的 cartItem, 則表示購物車內已經有這個商品
                                // 則增加數量
                                if(!created) {
                                    // 增加數量
                                    cartItem.update({quantity:cartItem.quantity + item.quantity});
                                }
                                // 將 req.session.cart 
                            }
                        } else {
                            // 如果 user 沒有購物車, 則將 req.session.cart 中的商品創建新的購物車
                            // 將 req.session.cart 中的商品創建 cartItem, 指定 cartId = newCart.id
                            for(const item of req.session.cart) {
                                await CartItem.create({
                                    cartId: existingCart.id,
                                    productId: item.productId,
                                    quantity: item.quantity
                                })
                            }
                        }
                        // 將 User 的購物車內容存入 req.session.cart
                        const cartItems = await CartItem.findAll({ where: { cartId: existingCart.id}});
                        // 根據 cartItems 撈取 product info
                        const products = await Promise.all(cartItems.map( async (item) => {
                            const product = await Product.findOne({
                                where: { id: item.productId }
                            });
                            return {
                                productId: product.id,
                                productNumber: product.productNumber,
                                name: product.name,
                                price: parseInt(product.basePrice),
                                quantity: item.quantity
                            }
                        }))
                        // 將 products 放入 session.cart
                        req.session.cart = products;
                    } else { // 登入前沒有以 guest 身分添加商品至購物車
                        // console.log('user: ' + user.id);
                        // 單純將 cart 撈取出來放入 req.session.cart, 提供前端渲染
                        const cart = await Cart.findOne({ where: { userId: user.id } });
                        // 撈取 cartItem 的 cartId 為 cart.id
                        const cartItems = await CartItem.findAll({ where: { cartId: cart.id}});
                        // 根據 cartItems 撈取 product info
                        const products = await Promise.all(cartItems.map( async (item) => {
                            const product = await Product.findOne({
                                where: { id: item.productId }
                            });
                            return {
                                productId: product.id,
                                productNumber: product.productNumber,
                                name: product.name,
                                price: parseInt(product.basePrice),
                                quantity: item.quantity
                            }
                        }))
                        // 將 products 放入 session.cart
                        req.session.cart = products;
                    }
                    console.log('----------------req.session.cart------------------');
                    console.log(req.session.cart);
                    res.redirect('/');
                } catch (cartError) {
                    console.error('Cart merge error:', cartError);
                    // 即使購物車合併失敗，也讓用戶成功登入
                    req.flash('warning_msg', '登入成功, 但購物車合併發生問題');
                    res.redirect('/');
                }
            });
        } catch (error) {
            console.error('Login controller error:', error);
            req.flash('error_msg', '系統錯誤，請稍後再試');
            res.redirect('/users/login');
        }
    })(req, res, next); // 給 passport.authticate() 回傳函式需要用的參數
};
// 忘記密碼頁面
const getForgotPasswordPage = async (req, res) => {
    res.render('users/forgot-password')
}
// 忘記密碼邏輯
const forgotPassword = async (req, res) => {
    try {
        // 1. 檢查 email 是否存在
        const { email } = req.body;
        const user = await User.findOne({ where: { email}});
        if(!user){
            // 沒有找到 user, 顯示錯誤訊息
            req.flash('error_msg', '找不到該電子郵件的用戶');
            return res.redirect('/users/forgot-password');
        }
        // email 存在, 產生 random token
        const token = crypto.randomBytes(32).toString('hex');
        // 設定 token_expires_at
        const now = new Date();
        const token_expires_at = new Date(now.getTime() + 1*60*60*1000); // 1 小時後過期
        // 更新 user 的 token 和過期時間
        user.resetPasswordToken = token;
        user.resetPasswordExpires = token_expires_at;
        await user.save();
        // 寄送重設密碼的 email
        await sendResetPasswordEmail(email, token);
        req.flash('success_msg', '重設密碼的連結已寄送到您的電子郵件，請檢查您的信箱');
        res.redirect('/users/forgot-password');
    } catch (error) {
        console.error('忘記密碼錯誤:', error);
        req.flash('error_msg', '無法處理忘記密碼請求，請稍後再試');
        throw error;
    }
}

const getResetPasswordPage = async (req, res) => {
    try {
        // 1. 驗證 token 是否存在
        const { token } = req.params;
        const user = await User.findOne({ where: { resetPasswordToken:token }});
        if(!user){
            // 沒有找到 user, 顯示錯誤訊息
            req.flash('error_msg', '無效的重設密碼連結');
            return res.redirect('/users/forgot-password');
        }
        
        // 2. 驗證 token 是否過期
        const now = new Date();
        if(user.resetPasswordExpires < now) {
            // token 過期
            req.flash('error_msg', '重設密碼連結已過期，請重新申請');
            return res.redirect('/users/forgot-password');
        }
        // 3. token 有效，顯示重設密碼頁面
        res.render('users/reset-password', { token });
    } catch (error) {
        console.error('重設密碼頁面錯誤:', error);
        req.flash('error_msg', '無法顯示重設密碼頁面，請稍後再試');
        res.redirect('/users/forgot-password');
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        // 檢查密碼是否一致
        if(password !== confirmPassword) {
            req.flash('error_msg', '密碼不一致，請重新輸入');
            return res.redirect(`/users/reset-password/${token}`);
        }

        // 1. 驗證 token 是否存在
        const user = await User.findOne({ where: { resetPasswordToken: token}});
        if(!user) {
            // 沒找到 user, 顯示錯誤訊息
            req.flash('error_msg', '無效的重設密碼連結');
            return res.redirect('/uers/forgot-password');
        }
        // 2. 產生加密的密碼
        const hashedPassword = await bcrypt.hash(password,10);
        // 3. 更新 user 的密碼和清除 token
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        // 4. 顯示成功訊息並導向登入頁面
        req.flash('success_msg', '密碼已成功重設，請登入');
        res.redirect('/users/login');
    } catch (error) {
        console.error('重設密碼錯誤:', error);
        req.flash('error_msg', '無法重設密碼，請稍後再試');
        res.redirect(`/users/reset-password/${token}`);
    }
}

module.exports = {
    register,
    logout,
    getLoginPage,
    getRegisterPage,
    loginUser,
    verifyToken,
    resendVerificationToken,
    getForgotPasswordPage,
    forgotPassword,
    getResetPasswordPage,
    resetPassword
}