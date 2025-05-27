const { Cart, Cartitem, Product } = require('../db/models')

// 購物車 CRUD
// 將商品加入購物車
const addProductToCart = async (req, res) => {
    try {
        console.log(req.user);
        // 若未登入, 且尚未建立 session
        if(!req.session.cart) {
            req.session.cart = [];
        }
        const { productNumber, quantity } = req.body;
        // 檢查商品是否存在
        const product = await Product.findOne({ where: { productNumber: productNumber } });
        if(!product){
            return res.status(404).json({error: 'Product not found'});
        }

        // 檢查購物車中是否已存在此商品
        const existingItemIndex = req.session.cart.findIndex(item => item.productNumber === productNumber);
        if(existingItemIndex !== -1) {
            req.session.cart[existingItemIndex].quantity += parseInt(quantity);
        } else {
            // 若不存在, 則新增商品至購物車
            req.session.cart.push({
                productId: product.id,
                productNumber:product.productNumber,
                name:product.name,
                price: parseInt(product.basePrice),
                quantity:parseInt(quantity),
            })
        }
        console.log(req.session.cart);

        // 回傳更新後的購物車
        res.status(200).json({
            status: 'success',
            message: 'Product added to cart successfully',
            cart: req.session.cart,
            cartItemCount: req.session.cart.length,
            totalItemCount: req.session.cart.reduce((total, item) => total + item.quantity, 0)
        })
        // guest 將訂單送出後, 才把 session 中的購物車資料存入資料庫

        // 已登入操作, 會先在登入後 (userController 中) 將資料庫的購物車填入 req.session.cart, 顯示在前端 view 中
        if(req.user) {
            // 若已登入, 將購物車資料存入資料庫
            const cart = await Cart.findOne({ where: { userId :req.user.id}});
            if(!cart) {
                // 若未建立購物車, 則建立一個新的cart
                const newCart = await Cart.create({ userId: req.user.id, status: 'user' });
                // 將商品加入新購物車
                // 創建 CartItem
                await Cartitem.create({
                    cartId:newCart.id,
                    productId: product.id,
                    quantity: parseInt(quantity)
                })
            } else {
                // 已經有購物車，檢查該商品是否已存在
                const existingCartItem = await Cartitem.findOne({
                    where:{
                        productId: product.id,
                        cartId: cart.id
                    }
                });
                if(existingCartItem) {
                    // 若商品已存在, 更新數量
                    await existingCartItem.update({
                        quantity: existingCartItem.quantity + parseInt(quantity)
                    });
                } else {
                    // 若商品不存在，建立新的 Cartitem
                    await Cartitem.create({
                        cartId: cart.id,
                        productId: product.id,
                        quantity: parseInt(quantity)
                    });
                }
            }
        }
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

module.exports = {
    addProductToCart
}