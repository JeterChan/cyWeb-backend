const { User, Cart, CartItem,Product } = require('../db/models');
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

module.exports = {
    register,
    logout,
    getLoginPage,
    getRegisterPage,
    loginUser
}