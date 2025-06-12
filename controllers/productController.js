const { Product, Subcategory, Category, Cart } = require('../db/models')
const { Op } = require("sequelize");

// get all products
// 顯示商品列表
const getProducts = async(req, res) => {
    try {
        console.log('🔹 檢查 Product 模型');
    
        // 檢查 Product 模型是否存在
        if (!db.Product) {
        return res.status(404).json({ 
            model: 'NOT_FOUND',
            availableModels: Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'),
            message: 'Product 模型不存在'
        });
        }
        
        console.log('🔹 Product 模型存在');
        
        // 測試基本查詢
        const count = await db.Product.count();
        console.log('🔹 Product 數量:', count);

        // 從查詢參數取得類別的slug
        const categorySlug = req.query.category;
        const subcategorySlug = req.query.subcategory;

        // 從查詢參數獲取當前頁碼, 若無則為1
        const currentPage = parseInt(req.query.page) || 1;
        const perPage = 12;

        let products = [];
        let totalCount = 0;
        let subcategories = [];

        // 先判斷 subcategory 有無存在
        // subcategorySlug 存在, 代表 category 必存在
        // 若選擇某類別的子類別, 左側的篩選器不需要變動, 維持原狀, 因此需要回傳該類別的所有子類別
        if(subcategorySlug) {
            // 回傳的 products 是該 subcategory 的所有商品
            const subcategory = await Subcategory.findOne({
                where:{slug:subcategorySlug},
            });

            // 找該 subcategory 的所有商品
            const {count, rows} = await Product.findAndCountAll({
                where:{subcategoryId:subcategory.id},
                limit: perPage,
                offset: (currentPage - 1) * perPage,
            })

            products = rows;
            totalCount = count;

            // 回傳category 的所有子類別
            categoryWithSub = await Category.findOne({
                where:{ slug: categorySlug },
                include:[{
                    model:Subcategory,
                    as:'subcategories',
                    attributes:['id','name','slug']
                }]
            });

            subcategories = categoryWithSub.subcategories;
        }

        // 若有指定的 category
        if(categorySlug && !subcategorySlug) {
            const categoryWithSub = await Category.findOne({
                where:{slug:categorySlug},
                include:[{
                    model:Subcategory,
                    as:'subcategories',
                    attributes:['id','name','slug'],
                }]
            });

            if(!categoryWithSub) {
                return res.status(404).json({
                    status:'error',
                    message:'找不到指定的類別'
                })
            }
            
            // 使用 map 陣列方法提取所有的屬於該 category 的 subcategory id
            const subcategoryIds = categoryWithSub.subcategories.map(sub => sub.id);
            subcategories = categoryWithSub.subcategories;

            // 一次查詢完所有子類別的商品
            // 避免 N+1 問題，多查詢一次，可能會消耗很多時間
            const result = await Product.findAndCountAll({
                where:{
                    subcategoryId:{
                        [Op.in]:subcategoryIds // 使用 Op.in 一次查詢完畢
                    }
                },
                limit:perPage,
                offset:(currentPage - 1) * perPage,
                include:[
                    {
                        model:Subcategory,
                        as:'subcategory',
                        attributes:['id','name'],
                        include:[{
                            model:Category,
                            as:'category',
                            attributes:['id','name']
                        }]
                    }
                ]
            });

            products = result.rows;
            totalCount = result.count;
        } 
        if(!categorySlug && !subcategorySlug) {
             // 查詢所有商品
            const { count, rows } = await Product.findAndCountAll({
                limit: perPage,
                offset: (currentPage - 1) * perPage
            });

            products = rows;
            totalCount = count;
        }

        // 回傳所有類別, 用於 Navbar
        // 前後端分離應該會有不同寫法，現在這個 route 負責渲染 product list, 若為前後端分離，會專門寫一支api回傳所有類別給navbar component用
        const categories = await Category.findAll();
        const totalPages = Math.ceil(totalCount / perPage);
        
        // 當沒有找到任何的商品或沒有任何類別的時候代表整個網站都沒東西
        if(products.length === 0) {
            req.flash('warning_msg', '沒有找到任何商品，請嘗試其他搜尋條件');
            return res.redirect('back'); // 或重定向到適當的頁面
        }

        // 渲染購物車內容
        const cart = req.session.cart || [];

        res.render('products/productList', {
            products:products,
            categories:categories, // 用於 _header.ejs 的類別選單
            currentCategory:categorySlug || '',
            currentSubcategory:subcategorySlug || '',
            subcategories: subcategories, // 回傳該 category 的所有子類別
            currentPage,
            totalPages,
            selectedCategory: categorySlug, // 點選分頁的時候可以帶著該分類的slug
            isAuthenticated: req.isAuthenticated(),
            cart:cart,
            cartItemCount: cart.length
        })

    } catch(error){
        res.status(500).json({
            status:'error',
            message:error.message
        })
    }
}

// get one product
const getOneProduct = async(req,res) => {
    try {
        const { productNumber } = req.params;

        if(!productNumber) {
            return res.status(404).json({
                status:'error',
                message:'There is no product you are looking for.'
            })
        }

        const product = await Product.findOne({
            where:{productNumber:productNumber}
        });

        // 渲染購物車內容
        const cart = req.session.cart || [];

        res.render('products/productDetail',{
            product:product,
            cart:cart,
            cartItemCount: cart.length,
        })
        
    } catch (error) {
        res.status(500).json({
            status:'error',
            message:error.message
        })
    }
}

// get category products
const getCategoryProducts = async (req, res) => {
    try {
        const { category } = req.params;

        if(!category) {
            return res.status(404).render('404');
        };
        // 回傳該 category 的 subcategory
        const categoryWithSub = await Category.findOne({
            where:{ slug:category },
            include:[{
                model:Subcategory,
                as:'subcategories'
            }]
        });

        // 一次查詢, 避免N+1問題
        // 回傳該類別的所有商品
        const products = await Product.findAll({
            where:{
                subcategoryId:{
                    [Op.in]:categoryWithSub.subcategories.map(sub => sub.id)
                }
            }
        })
        
        
    } catch (error) {
        
    }
}

// get subcategory products
const getSubcategoryProducts = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}
// create new product
const createNewProduct = async (req, res) => {
    try {
        const { productNumber,
                price, 
                description,
                specification,
                image,
                subcategory,
                name,
                quantity} = req.body;

        if(!productNumber || !price || !subcategory || !name) {
            return res.status(401).json({
                status:'error',
                message:'提供的資料不齊全,無法建立商品'
            })
        }

        // 查詢 subcategory 的 id
        const subcategoryId =  await Subcategory.findOne({
            where:{
                name:subcategory
            }
        })

        const newProduct = await Product.create({
            productNumber,
            name,
            basePrice:price,
            quantity,
            description,
            specification,
            image:image,
            subcategoryId:subcategoryId.id,
        })

        res.status(200).json({
            status:'success',
            data:newProduct
        })
    } catch (error) {
        res.status(500).json({
            status:'error',
            message:error.message
        })
    }
}

// update product
const updateProduct = async(req, res) => {
    try {
        const product = await Product.findOne({
            where:{
                productNumber:req.params.productNumber
            }
        });

        if(!product) {
            return res.status(404).json({
                status:'error',
                message:'商品不存在'
            })
        }

        // 驗證更新的資料
        const updateData = {};
        const allowedfields = ['name','basePrice','quantity',
                                'description','specification',
                                'state','image']
        
        for(const field of allowedfields) {
            if(req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        // 額外處理 subcategory
        if(req.body['subcategory'] !== undefined){
            const subcategoryObj = await Subcategory.findOne({
                where:{
                    name:req.body['subcategory']
                }
            })

            updateData['subcategoryId'] = subcategoryObj.id;
        } 
        

        // 如果沒有要更新的資料
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status:'error',
                message:'沒有提供要更新的資料'
            })
        }

        // 更新商品資料
        await product.update(updateData);

        res.status(200).json({
            status:'success',
            data:product
        })
    } catch (error) {
        res.status(500).json({
            status:'error',
            message:'更新失敗',
            error:error.message
        })
    }
}

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            where:{
                productNumber:req.params.productNumber
            }
        });

        if(!product) {
            return res.status(404).json({
                status:'error',
                message:'商品不存在'
            })
        }

        await product.destroy();
        res.status(200).json({
            status:'success',
            message:'成功刪除'
        })

    } catch (error) {
        res.status(500).json({
            status:'error',
            error:error.message
        })
    }
}

// get product EDM
const getProductsEDM = async (req, res) => {
    const { page } = req.params; // A, B, C ...
    // 渲染購物車內容
    const cart = req.session.cart || [];
    const cartItemCount = cart.length;
    const totalItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    if(!page) {
        return res.redirect('/products/A');
    }
    // 驗證 page 參數
    if (!/^[A-P]$/.test(page)) {
        return res.status(404).render('404'); // 或重導至首頁
    }
    
    try {
        // 去 db 撈 productNumber 為 ${page} 開頭的商品
        const products = await Product.findAll({
            where:{
                productNumber: {
                    [Op.like]:`${page}%`
                }
            }
        })

        const imagePath = `EDM-2025-03-${page}.jpg`;
        res.render('products/product',{
            productImage: imagePath,
            products: products,
            currentPage: page,  // 新增這個參數
            cart: cart,
            cartItemCount: cartItemCount,
            totalItemCount: totalItemCount,
        });
    } catch (error) {
        console.error('載入產品目錄時發生錯誤:', error);
        res.status(500).render('error', { message: '載入失敗' });
    }

}

// post: upload images
const uploadImage = async (req, res) => {
    // 將 image 儲存在 CDN
    // MVP 階段先在 diskstorage
    try {
        console.log(req.files);

        if(req.body && req.files) {
            return res.status(200).json({
                status:'success',
                message:'upload success'
            })
        } else {
            return res.status(404).json({
                status:'error',
                message:'Please upload again'
            })
        }
    } catch (error) {
        res.status(500).json({
            status:'error',
            message:error.message
        })
    }    
}

module.exports = {
    getProducts,
    getOneProduct,
    createNewProduct,
    updateProduct,
    deleteProduct,
    getProductsEDM,
    uploadImage,
    getCategoryProducts,
    getSubcategoryProducts
}