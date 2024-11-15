const { Cart, Cartitem, Product } = require('../db/models')

// 購物車 CRUD
// 將商品加入購物車
const addProductToCart = async (req, res) => {
    try {
        const { productNumber, quantity } = req.body;
        // get product
        const product = await Product.findOne({
            where:{
                productNumber:productNumber
            }
        })
        // 若 product 不存在則回報 404
        if(!product) {
            res.status(404).json({
                status:'error',
                message:'無法找到該商品'
            })
        }
        // 先判斷有無登入 req.user 是否存在, 若存在則代表有登入, 不存在代表未登入
        // 未登入的話先查看 req.session.cartId 是否存在, 若無則創建一個
        if(!req.user) {
            // 創建 or 尋找 Cart
            const [cart, created] = await Cart.findOrCreate({
                where:{
                    sessionId:req.sessionID,
                    status:'guest',
                    userId:null
                }
            })
            // console.log(cart)
            // 若是新創建的 cart, 存在 session 內
            if(created){req.session.cartId = cart.id;} // 指定 cartId 存在 session
            // console.log(req.session.cartId)
            
            // console.log(product)
            // 檢查 cart 是否存有該商品
            const [cartItem,itemCreated] = await Cartitem.findOrCreate({
                where:{
                    cartId:cart.id,
                    productId:product.id
                },
                defaults:{
                    quantity:quantity
                }
            })
            console.log(itemCreated)
            if(!itemCreated){
                // 若商品有在購物車內則更新數量
                await Cartitem.update({
                    quantity:cartItem.quantity + quantity
                },
                {
                    where:{
                        cartId:cart.id,
                        productId:product.id
                    }
                })
            }
            // 取得更新後的購物車項目
            const updatedCartItem = await Cartitem.findOne({
                where: {
                    cartId: cart.id,
                    productId: product.id
                }
            });
    
            res.status(200).json({
                status: 'success',
                cartId: req.session.cartId,
                Cartitem: updatedCartItem
            }); 
        } else {
            // 已登入的使用者
            // 查看session有沒有cartId, 有的話代表有身為訪客建立cart, 去找該user有沒有cart, 若有則要合併訪客時的cart和現在的cart,若無則直接新建一個cart
            if(req.session.cartId) {
                // 若未登入時有添加商品至購物車,先去看該user有沒有創建過cart,若沒有則轉移訪客的cart
                const cart = await Cart.findOne({
                    where:{
                        userId:req.user.id,
                        status:'user'
                    }
                })
                // 若 Cart 不存在則轉移 status = 'guest' -> 'user', 並且將 product 加入至購物車內
                if(!cart){
                    await Cart.update(
                        {
                            userId:req.user.id,
                            status:'user'
                        },
                        {
                            where:{
                                sessionId:req.sessionID
                            },
                        },
                    )
                    // 將 product 加入至購物車
                    await Cartitem.create({
                        cartId:req.session.cartId,
                        productId:product.id,
                        quantity:quantity
                    })
                } else {
                    // 若cart存在就需要合併訪客購物車和user購物車內容
                }
            } else {
                // req.session.cartId 不存在, 單純添加進入購物車
                
            }
        }
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

module.exports = {
    addProductToCart
}