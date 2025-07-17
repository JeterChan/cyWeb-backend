const { Product, Subcategory, Category} = require('../db/models')
const { Op } = require("sequelize");

const productService = require('../services/productService');

// get all products
// 顯示商品列表
const getProducts = async(req, res) => {
    try {
        const categorySlug = req.query.category;
        const subcategorySlug = req.query.subcategory;
        const page = req.query.page || 1;

        const data = await productService.getProductsData(categorySlug, subcategorySlug, page);

        // 處理 Service 層回傳的 null (表示找不到類別)
        if (data === null) {
            return res.status(404).json({
                status: 'error',
                message: '找不到指定的類別'
            });
        }

        // 如果沒有找到任何商品，重定向並顯示警告
        if (data.products.length === 0) {
            req.flash('warning_msg', '沒有找到任何商品，請嘗試其他搜尋條件');
            return res.redirect('back');
        }

        // 渲染購物車內容 (這是 Express 應用的常見模式)
        const cart = req.session.cart || [];

        res.render('products/productList', {
            products: data.products,
            categories: data.categories,
            currentCategory: categorySlug || '',
            currentSubcategory: subcategorySlug || '',
            subcategories: data.subcategories,
            currentPage: data.currentPage,
            totalPages: data.totalPages,
            selectedCategory: categorySlug,
            isAuthenticated: req.isAuthenticated(),
            cart: cart,
            cartItemCount: cart.length
        });

    } catch(error) {
        console.error(error); // 記錄錯誤
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

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
    uploadImage,
}