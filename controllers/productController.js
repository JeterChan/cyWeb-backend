const { Product, Subcategory, Category, Cart } = require('../db/models')
const { Op } = require("sequelize");

// get all products
// 顯示商品列表
const getProducts = async(req, res) => {
    try {
        // 從查詢參數取得類別的slug
        const categorySlug = await req.query.category;

        // 從查詢參數獲取當前頁碼, 若無則為1
        const currentPage = parseInt(req.query.page) || 1;
        const perPage = 12;

        let products = [];
        let totalCount = 0;

        // 若有指定的 category
        if(categorySlug) {
            const categoryWithSub = await Category.findOne({
                where:{slug:categorySlug},
                include:[{
                    model:Subcategory,
                    as:'subcategories',
                    attributes:['id']
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
        } else {
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
            return res.status(400).json({
                status:'error',
                message:'沒有找到符合條件的商品'
            })
        }

        res.render('products/productList', {
            products:products,
            categories:categories,
            currentPage,
            totalPages,
            selectedCategory: categorySlug, // 點選分頁的時候可以帶著該分類的slug
            isAuthenticated: req.isAuthenticated(),
            cart:req.user ? req.user.cart : null
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

        res.render('products/productDetail',{
            product:product
        })
        
    } catch (error) {
        res.status(500).json({
            status:'error',
            message:error.message
        })
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

module.exports = {
    getProducts,
    getOneProduct,
    createNewProduct,
    updateProduct,
    deleteProduct
}