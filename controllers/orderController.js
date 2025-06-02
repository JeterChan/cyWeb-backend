const order = require('../db/models/order');
const { Order, OrderItem } = require('../db/models');
const readCheckoutPage = async (req, res) => {
    try {
        // get cartItems
        const cart = req.session.cart; // 購物車陣列
        const totalAmount = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
        res.render('orders/checkout-step1',{
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

const getCheckoutStep2 = async(req,res)=>{
    try {
        // get cartItems
        const cart = req.session.cart; // 購物車陣列
        const totalAmount = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
        req.session.orderInformation = {
            customerInfo:{
                name:req.body.company || '',
                contactPerson:req.body.contactPerson || '',
                email:req.body.email || '',
                phone:req.body.phone || '',
                invoiceTitle:req.body.invoiceTitle || '',
                taxId:req.body.taxId || '',
            }
        };
        res.render('orders/checkout-step2', {
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

const getCheckoutStep3 = async(req,res)=>{
    try {
        // get cartItems
        const cart = req.session.cart; // 購物車陣列
        const totalAmount = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
        req.session.orderInformation.delivery = {
            street:req.body.street || '',
            city:req.body.city || '',
            zip:req.body.zip || '',
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
        // test order number
        const orderNumber = 'ORD-' + Date.now();
        const subtotal = cart.reduce((sum, item)=> sum + item.price, 0);
        const shippingFee = 60;
        const discountAmount = 1; // 暫時寫死，未來可根據邏輯調整
        const totalAmount = (subtotal+shippingFee) * discountAmount;
        // 1. 儲存進 databse
        // 建立 order
        
        const newOrder = await Order.create({
            userId:req.user?.id || null,
            orderNumber:orderNumber,
            subtotal:subtotal,
            shippingFee:60,// 會改
            discountAmount:1, // ratio
            taxAmount:0, // 會改
            totalAmount:(subtotal+shippingFee) * discountAmount,
            paidAt:new Date, // 會改
            completed:new Date // 會改
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
        console.log(req.session.orderInformation);
        // 2. 儲存成功後刪除 req.session.cart
        req.session.cart = [];
        req.session.orderInformation = {};
        res.render('orders/checkout-success', {
            paymentMethod,
            orderNumber,
            totalAmount
        })
    } catch (error) {
        console.log(error.message);
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
    getCheckoutSuccess
}