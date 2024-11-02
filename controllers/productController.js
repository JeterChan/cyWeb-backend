const Product = require('../models/productModel');
const Image = require('../models/imageModel');
const Category = require('../models/categoryModel');
const path = require('path');

// CRUD api
// get all product
const getProductPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1 // current page
        const limit = parseInt(req.query.limit) || 12 // 每頁顯示數量
        const skip = (page - 1) * limit; // 跳過的數量
        const categoryName = req.query.category;

        const query = categoryName ? {category:categoryName} : {}

        const [products, categories, totalProducts] = await Promise.all([
            Product.find(query)
                .skip(skip)
                .limit(limit)
                .select('product_id title price'),
            Category.find(),
            Product.countDocuments(query)
        ])

        console.log(categories);

        res.render('products/productList', {
            title:'ProductList',
            products,
            categories,
            currentPage:page,
            totalPages: Math.ceil(totalProducts / limit),
        })
    
    } catch(error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: '獲取商品列表失敗',
            error: error.message
        });
    }
}

// read one product
const getOneProduct = async (req,res) => {
    const { product_id } = req.params;

    try {
        const product = await Product.findOne({product_id: product_id});

        res.render('products/product_detail', {
            title:'product_detail',
            product:product,
            cartItemCount :10
        })
    } catch(error) {
        res.status(404).json({message:'Can not find the product'})
    }   
}

// create product
const createProduct = async (req,res) => {
    try {
        const product = await Product.create(req.body);
        res.status(200).json(product);
    } catch(error) {
        res.status(500).json({message:error.message});
    }
}

// update product info
const updateProduct = async (req,res) => {
    try {
        const { _id } = req.params;
        const product = await Product.findByIdAndUpdate(_id, req.body);

        if(!product) {
            return res.status(404).json({message:"Product not found"});
        }

        const updatedProduct = await Product.findById(_id);
        res.status(200).json(updatedProduct);

    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

//delete product 
const deleteProduct = async (req,res) => {
    try {
        const { _id } = req.params;
        const product = await Product.findByIdAndDelete(_id);

        if(!product) {
            return res.status(404).json({message:"Product not found"});
        }

        res.status(200).json({message:"Product delete successfully"});
    } catch (error){
        res.status(500).json({message:error.message});
    }
}

// upload image
const uploadImage = async (req, res) => {
    if(!req.files || req.files.lenth === 0) {
        return res.status(400).send('No files were upload');
    }

    try {
        const uploadedProducts = [];

        for (const file of req.files) {
            const product_id = extractProductId(file.originalname);

            // 判斷product_id 是否已存在
            let product = await Product.findOne({product_id: product_id});

            // 若 product 不存在，創建一個新的 product
            if(!product) {
                product = new Product({
                    product_id:product_id,
                    price:0
                });
            }

            // update image field
            product.image = {
                data:file.buffer,
                contentType:file.mimetype,
                filename:file.originalname
            }

            const savedProduct = await product.save();
            uploadedProducts.push({
                _id:savedProduct._id,
                product_id:savedProduct.product_id,
                filename:savedProduct.image.filename,
                contentType:savedProduct.image.contentType,
            });
        }

        res.json({
            message:'Files uploaded successfully',
            files:uploadedProducts
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).send('Error uploading files');
    }
}

// read image
const readImage = async (req, res) => {
    try {
        const image = await Image.findOne({product_id:req.params._id});

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.set('Content-Type', 'image/jpg');

        res.status(200).send(image.data);
    } catch (error) {
        res.status(404).json({message:error.message});
    }
}

function extractProductId(filename) {
    //name return only filename
    //base return filename with extension
    return path.parse(filename).name;
}

module.exports = { 
    getProductPage, 
    getOneProduct, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    uploadImage,
    readImage
};
