const { Order, OrderItem, Payment, Product } = require('../db/models');
const readCheckoutPage = async (req, res) => {
    try {
        // get cartItems
        const cart = req.session.cart; // 購物車陣列
        const totalAmount = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
        res.render('orders/checkout-step1',{
            cartItems:cart,
            totalAmount:totalAmount
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getCheckoutStep2 = async(req,res)=>{
    try {
        // get cartItems
        const cart = req.session.cart; // 購物車陣列
        const totalAmount = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
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
        res.render('orders/checkout-step2', {
            cartItems:cart,
            totalAmount:totalAmount
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getCheckoutStep3 = async(req,res)=>{
    try {
        // get cartItems
        const { street, city, zip} = req.body;
        const cart = req.session.cart; // 購物車陣列
        const totalAmount = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
        const customerAddress = city + street;
        req.session.orderInformation.delivery = {
            customerAddress:customerAddress,
            addressZipCode:zip
        };
        res.render('orders/checkout-step3', {
            // isCheckout: true,
            cartItems:cart,
            totalAmount:totalAmount
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getCheckoutSuccess = async(req,res)=>{
    try {
        const { paymentMethod } = req.body;
        const cart = req.session.cart;
        req.session.orderInformation.paymentMethod = {
            method:paymentMethod || '',
        };
        const orderInfo = req.session.orderInformation;
        // test order number
        const orderNumber = 'ORD-' + Date.now();
        const paymentNumber = 'PAY-' + Date.now();
        const subtotal = cart.reduce((sum, item)=> sum + item.price, 0);
        const shippingFee = 60;
        const discountAmount = 1; // 暫時寫死，未來可根據邏輯調整
        const totalAmount = (subtotal+shippingFee) * discountAmount;
        // 1. 儲存進 databse
        // 建立 order
        console.log(req.session.orderInformation);
        const newOrder = await Order.create({
            userId:req.user?.id || null,
            orderNumber:orderNumber,
            subtotal:subtotal,
            shippingFee:60,// 會改
            discountAmount:1, // ratio
            taxAmount:0, // 會改
            totalAmount:(subtotal+shippingFee) * discountAmount,
            company:orderInfo.customerInfo.company || null,
            customerName:orderInfo.customerInfo.contactPerson,
            customerEmail:orderInfo.customerInfo.email,
            customerPhone:orderInfo.customerInfo.phone,
            addressZipCode:orderInfo.delivery.addressZipCode,
            customerAddress:orderInfo.delivery.customerAddress,
            invoiceTitle:orderInfo.customerInfo.invoiceTitle || null,
            taxId:orderInfo.customerInfo.taxId || null,
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
            paymentMethod:paymentMethod,
            amount:(subtotal+shippingFee) * discountAmount
        })
        
        // 2. 儲存成功後刪除 req.session.cart
        req.session.cart = [];
        req.session.orderInformation = {};
        // 3. sendgrid 寄信給user
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).render('500');
            }

            res.render('orders/checkout-success', {
                paymentMethod,
                orderNumber,
                totalAmount
            });
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getOrderhistory = async(req, res) => {
    try {
        // 1. 抓取該 user 的所有訂單和訂單內容
        const orders = await Order.findAll({
            where:{
                userId:req.user.id
            }
        });
        
        res.render('orders/history',{
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
            res.status(404).render('404');
        };
        console.log(order.orderItems);
        res.render('orders/order-detail', {
            order:order
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
module.exports = {
    readCheckoutPage,
    getCheckoutStep2,
    getCheckoutStep3,
    getCheckoutSuccess,
    getOrderhistory,
    getOrderDetail
}