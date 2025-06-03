const { Order, Payment, OrderItem,Product } = require('../db/models');

// 訂單列表頁
const getAdminOrdersPage = async (req, res) => {
    // get order and payment
    const orders = await Order.findAll({
        include:[
            {
                model:Payment,
                as:'payment',
                attributes:['paymentMethod']
            }
        ],
        orders:[['createdAt','DESC']]
    });
    
    res.render('admin/orders', {orders});
};

// 單筆訂單詳情頁
const getOrderDetail = async (req,res) => {
    const { orderNumber } = req.params;
    const order = await Order.findOne({
        where:{
            orderNumber:orderNumber
        },
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
            }
        ]
    });
    if(!order) {
        return res.status(404).json({
            success:false,
            message:'找不到訂單'
        })
    };
    res.render('admin/order-detail', {order});
};

const updateOrderStatus = async (req, res) => {
    try {
         const { status } = req.body;
        const { orderNumber } = req.params;
        // update order status
        // return array, 更新幾筆, 若0 代表沒更新到
        const order = await Order.update(
            {status:status},
            {where:{orderNumber:orderNumber}}
        );
        
        if(order.length === 0) {
            res.status(404).render('404');
        }

        res.redirect('/admin/orders');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
   
};

module.exports = {
    getAdminOrdersPage,
    getOrderDetail,
    updateOrderStatus
}