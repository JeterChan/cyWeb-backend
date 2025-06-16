const { Order, OrderItem, Payment, Product, Cart ,CartItem} = require('../db/models');
const { sendOrderEmail } = require('../utils/mailer');
const { getPaymentMethodLabel } = require('../utils/labelHelpers');

// get: render personal info page
const getCheckoutPage = async (req, res) => {
    try {
        // get cartItems
        const cart = req.session.cart; // 購物車陣列
        const data = req.session.orderInformation?.customerInfo || {};

        const totalAmount = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
        return res.render('orders/checkout-step1',{
            cartItems:cart,
            totalAmount:totalAmount,
            data:data
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// post: store customer personal info into session
const postPersonalInfo = async (req, res) => {
    try {
        req.session.orderInformation = {
            customerInfo:{
                company:req.body.company || '',
                contactPerson:req.body.contactPerson || '',
                email:req.body.email || '',
                phone:req.body.phone || '',
                invoiceTitle:req.body.invoiceTitle || '',
                taxId:req.body.taxId || '',
            }
        };
        console.log(req.session.orderInformation);
        return res.redirect('/orders/address');
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get: render checkout address
const getCheckoutStep2 = async(req,res)=>{
    try {
        // get cartItems
        const cart = req.session.cart; // 購物車陣列
        const data = req.session.orderInformation?.delivery || {};
        const totalAmount = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);

        return res.render('orders/checkout-step2', {
            cartItems:cart,
            totalAmount:totalAmount,
            data:data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// post: store delivery information into session
const postCheckoutStep2 = async(req,res)=>{
    try {
        const { street, city, zip} = req.body;
        const customerAddress = city + street;
        req.session.orderInformation.delivery = {
            street:street || '',
            city:city || '',
            zip:zip || '',
            customerAddress:customerAddress,
            addressZipCode:zip
        };

        return res.redirect('/orders/payment');
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get: render payment page
const getCheckoutStep3 = async(req,res)=>{
    try {
        // get cartItems
        const cart = req.session.cart; // 購物車陣列
        const data = req.session.orderInformation?.paymentMethod || {};
        const totalAmount = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);

        return res.render('orders/checkout-step3', {
            cartItems:cart,
            totalAmount:totalAmount,
            data:data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// post: store payment method inot session
const postCheckoutStep3 = async(req, res) => {
    try {
        const {paymentMethod} = req.body;
        req.session.orderInformation.paymentMethod = {
            method:paymentMethod || '',
        };

        return res.redirect('/orders/confirmation');
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

// post: 確定訂單頁
const postCheckoutConfirmation = async(req, res) => {
    try {
        const cart = req.session.cart;
        const orderInfo = req.session.orderInformation;
        console.log(cart);
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity ,0);
        const shippingFee = 60; // 暫時寫死，未來可根據邏輯調整
        const total = subtotal + shippingFee; // 暫時寫死，未來可根據邏輯調整
        // 1. customerInfo
        // 2. delivery
        // 3. paymentMethod
        return res.render('orders/order-confirmation', {
            cart:req.session.cart,
            subtotal:subtotal,
            total:total,
            customerInfo:orderInfo.customerInfo,
            delivery:orderInfo.delivery,
            paymentMethod:orderInfo.paymentMethod.method || '',
            shippingFee:shippingFee // 暫時寫死，未來可根據邏輯調整
        });
        
    } catch (error) {
        console.log(error.message);
        req.flash('error', '無法取得訂單資訊，請稍後再試');
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

// post: 提交訂單
const getCheckoutSuccess = async(req,res)=>{
    try {
        const { notes } = req.body;
        const cart = req.session.cart;
        const orderInfo = req.session.orderInformation;
        // test order number
        const orderNumber = 'ORD-' + Date.now();
        const paymentNumber = 'PAY-' + Date.now();
        const subtotal = cart.reduce((sum, item)=> sum + item.price * item.quantity, 0);
        const shippingFee = 0;
        const discountAmount = 1; // 暫時寫死，未來可根據邏輯調整
        const totalAmount = (subtotal) * discountAmount;
        // 1. 儲存進 databse
        // 建立 order
        console.log(req.session.orderInformation);
        const newOrder = await Order.create({
            userId:req.user?.id || null,
            orderNumber:orderNumber,
            subtotal:subtotal,
            shippingFee:0,// 會改
            discountAmount:1, // ratio
            taxAmount:0, // 會改
            totalAmount:totalAmount,
            company:orderInfo.customerInfo.company || null,
            customerName:orderInfo.customerInfo.contactPerson,
            customerEmail:orderInfo.customerInfo.email,
            customerPhone:orderInfo.customerInfo.phone,
            addressZipCode:orderInfo.delivery.addressZipCode,
            customerAddress:orderInfo.delivery.customerAddress,
            invoiceTitle:orderInfo.customerInfo.invoiceTitle || null,
            taxId:orderInfo.customerInfo.taxId || null,
            notes:notes || '',
        });
        if(!newOrder){
            // 訂單儲存失敗
            res.status(404).render('404');
        }
        // create orderItem
        await Promise.all(cart.map(cartItem=> {
            return OrderItem.create({
                orderId:newOrder.id,
                productId:cartItem.productId,
                quantity:cartItem.quantity,
                unitPrice:cartItem.price,
                subtotal:cartItem.price * cartItem.quantity
            });
        }));
        // create payment
        await Payment.create({
            orderId:newOrder.id,
            paymentNumber:paymentNumber,
            paymentMethod:orderInfo.paymentMethod.method || '',
            amount:(subtotal+shippingFee) * discountAmount
        })

        // 刪除 cart 和 cartItem 的資料
        if(req.user) {
            // 若有登入, 刪除 cartItem
            const userCart = await Cart.findOne({
                where: { userId: req.user.id }
            });
            await CartItem.destroy({
                where: {
                    cartId:userCart.id
                }
            })
        }

        // add subtotal into each cartItem in cart
        cart.forEach(item => {
            item.subtotal = item.price * item.quantity;
        })
        
        // 2. sendgrid 寄信給user
        const to = orderInfo.customerInfo.email;
        const subject = `您的訂單 ${newOrder.orderNumber} 已送出`;
        const dynamicData = {
            "orderId": newOrder.orderNumber || "",
            "company": orderInfo.customerInfo.company || "",
            "orderDate": (newOrder.createdAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'}) || "",
            "shippingAddress": orderInfo.delivery.customerAddress || "",
            "paymentMethod": getPaymentMethodLabel(orderInfo.paymentMethod.method) || "",
            "notes": newOrder.notes || "",
            "items": cart ,
            "totalAmount": newOrder.totalAmount
        }

        await sendOrderEmail(to,subject, dynamicData);
        // 3. 儲存成功後刪除 req.session.cart
        req.session.cart = [];
        req.session.orderInformation = {};

        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).render('500');
            }

            return res.render('orders/checkout-success', {
                paymentMethod: orderInfo.paymentMethod.method || '',
                orderNumber,
                totalAmount
            });
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get: 取的訂單歷史紀錄
const getOrderhistory = async(req, res) => {
    try {
        // 1. 抓取該 user 的所有訂單和訂單內容
        const orders = await Order.findAll({
            where:{
                userId:req.user.id
            }
        });
        
        return res.render('orders/history',{
            orders:orders
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

// get: 取得單一訂單紀錄
const getOrderDetail = async(req, res) => {
    try {
        const { orderNumber } = req.params;
        const order = await Order.findOne({
            where:{orderNumber:orderNumber},
            include:[
                {
                    model:OrderItem,
                    as:'orderItems',
                    include:[
                        {
                            model:Product,
                            as:'product'
                        }
                    ]
                },
                {
                    model:Payment,
                    as:'payment'
                }
            ],
        });
        if(!order) {
            return res.status(404).render('404');
        };
        console.log(order.orderItems);
        return res.render('orders/order-detail', {
            order:order
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

module.exports = {
    getCheckoutPage,
    postPersonalInfo,
    getCheckoutStep2,
    postCheckoutStep2,
    getCheckoutStep3,
    postCheckoutStep3,
    getCheckoutSuccess,
    getOrderhistory,
    getOrderDetail,
    postCheckoutConfirmation
}