const { Order, Payment, OrderItem,Product } = require('../db/models');
const { Op } = require('sequelize');

// 訂單列表頁
const getAdminOrdersPage = async (req, res) => {
    // get order and payment
    const status = req.query.status || '';
    const search = req.query.search || '';

    const where = {};
    if(status) where.status = status;
    if(search) {
        where[Op.or] = [
            { orderNumber: {[Op.like]: `%${search}%`}},
            { customerName: {[Op.like]: `%${search}%`}},
            { company: {[Op.like]: `%${search}%`}}
        ];
    }

    // 回傳不同 status 的訂單數量
    const [orders, totalOrders, processingCount, deliveredCount, completedCount, cancelCount] = await Promise.all([
        Order.findAll({where,order:[['createdAt','DESC']]}),
        Order.count(),
        Order.count({where:{ status: 'processing'}}),
        Order.count({where:{ status: 'delivered'}}),
        Order.count({where:{ status: 'completed'}}),
        Order.count({where:{ status: 'cancel'}})
    ]);

    res.render('admin/orders', {
        orders,
        totalOrders,
        processingCount,
        deliveredCount,
        completedCount,
        cancelCount,
        status,
        search,
        renderCard:(label,count,color) => {
            let id = '';
            switch(label) {
                case '總訂單': id = 'totalOrdersCount'; break;
                case '處理中': id = 'processingCount'; break;
                case '已出貨': id = 'deliveredCount'; break;
                case '完成': id = 'completedCount'; break;
                case '取消': id = 'cancelCount'; break;
            }
            return `
                <div class="col-md-2">
                    <div class="order-card text-center">
                    <div>${label}</div>
                    <div class="fs-4 fw-bold text-${color}"><span id="${id}">${count}</span></div>
                    </div>
                </div>
            `
        } 
    });
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
    res.render('admin/order-detail', {
        order
    });
};

// 更新訂單狀態
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
        res.status(200).json({
            success:true,
            message:'Order update successfully'
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
   
};

// 回傳各訂單狀態的數量
const getOrdersStatus = async (req, res) => {
    try {
        const totalOrdersCount = await Order.count();
        const processingCount = await Order.count({where:{ status: 'processing' }});
        const deliveredCount = await Order.count({where:{ status: 'delivered'}});
        const completedCount = await Order.count({where:{ status: 'completed'}});
        const cancelCount = await Order.count({where:{ status: 'cancel'}});

        res.status(200).json({
            totalOrdersCount,
            processingCount,
            deliveredCount,
            completedCount,
            cancelCount
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

module.exports = {
    getAdminOrdersPage,
    getOrderDetail,
    updateOrderStatus,
    getOrdersStatus
}