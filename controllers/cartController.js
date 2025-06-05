const { Cart, CartItem, Product } = require('../db/models')

// 購物車 CRUD
// Post: 將商品加入購物車
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
                spec:product.specification,
                name:product.name,
                price: parseInt(product.basePrice),
                quantity:parseInt(quantity),
            })
        }
        console.log(req.session.cart);

        // 回傳更新後的購物車
        res.status(200).json({
            success: true,
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
                await CartItem.create({
                    cartId:newCart.id,
                    productId: product.id,
                    quantity: parseInt(quantity)
                })
            } else {
                // 已經有購物車，檢查該商品是否已存在
                const existingCartItem = await CartItem.findOne({
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
                    // 若商品不存在，建立新的 CartItem
                    await CartItem.create({
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

// POST: update cart
const updateCart = async (req, res) => {
    // 更新商品數量, 當商品數量為1時, 若再按下'-', 則跳出視窗詢問是否要刪除該商品
    // 針對 req.session.cart 的內容作修改, 若為User,則更新DB
    try {
        // 針對 guest 的更新購物車
        const { productId, quantity } = req.body;
        const currentCart = req.session.cart;
        // 找到是針對 req.session.cart 內哪一個 product 做更新
        // array find method
        const foundProductIndex = currentCart.findIndex((item) => { return item.productId == productId });
        if(foundProductIndex != -1) {
            // 若是減少數量, 會回傳負數
            // 更新 req.session.cart 內的商品數量
            currentCart[foundProductIndex].quantity = quantity;
            if(currentCart[foundProductIndex].quantity === 0) {
                // 跳出詢問是否要刪除商品的視窗

            }
            // 將更新後的購物車儲存進 req.session.cart
            req.session.cart = currentCart;
            if(req.user) {
                // 若有登入, 將req.session.cart 儲存進 db
                const cart = await Cart.findOne({
                    where:{
                        userId:req.user.id
                    }
                })
                // update cartItem
                // 更新 cartItem 的 quantity
                await CartItem.update(
                    { quantity: currentCart[foundProductIndex].quantity},
                    {
                        where:{
                            productId:currentCart[foundProductIndex].productId,
                            cartId:cart.id
                        },
                    },
                );
            }
            // 更新 totalItemCount,cartItemCount
            res.status(200).json({
                success:true,
                message:'Update cart Item successfully',
                cart:currentCart,
                cartItemCount:currentCart.length,
                totalItemCount:currentCart.reduce((total,item) => total + item.quantity, 0)
            })
        } else {
            res.status(404).json({success:false, message:'Can not find the product'});
        }
        
    } catch (error) {
        console.log('Error:' + error.message);
        res.status(500).json({message:error.message});
    }
} 

// delete: delete cart item
const deleteCartItem = async(req, res) => {
    try {
        const { productId } = req.body;
        // 刪除 req.session.id 中的 product
        const currentCart = req.session.cart;
        const filterCart =  currentCart.filter(item => item.productId != productId);
        console.log('filterCart:' + filterCart);
        req.session.cart = filterCart; // 將更新後的 array 指定給 req.session.cart
        // 若是 user -> 有登入
        // 將 cartItem 刪除
        if(req.user) {
            const userCart = await Cart.findOne({
                where:{ userId: req.user.id}
            });

            if(!userCart){
                res.status(404).json({
                    success:false,
                    message:'Can not find the user cart! Please login first'
                })
            }
            
            // 刪除該cartItem
            await CartItem.destroy({
                where:{ 
                    cartId: userCart.id,
                    productId:productId                    
                }
            });
        }; 

        res.status(200).json({
            success:true,
            message:'Delete the product successfully!'
        })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// remove all cartitems from cart
const clearCart = async(req,res) => {
    req.session.cart = []; // 清空購物車
    // 若有登入則清空 cartItem
    if(req.user){
        const cart = await Cart.findOne({ where: { userId: req.user.id }});
        // 若找不到該 cart, 回傳錯誤
        if(!cart) {
            res.status(404).json({
                success:false,
                message:"There is no cart"
            });
        };
        // delete 該 cartId 的 cartItem
        await CartItem.destroy({
            where:{
                cartId:cart.id
            }
        })
    };
    
    res.status(200).json({
        success:true
    });
}

module.exports = {
    addProductToCart,
    updateCart,
    deleteCartItem,
    clearCart
}