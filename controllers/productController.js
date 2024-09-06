const ProductModel = require('../models/productModel');

// CRUD api

// get all product
const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.find();
    } catch(error) {
        res.status(500).json({message:error.message})
    }

    res.status(200).json(products)

}

// read one product
const getOneProduct = async (req,res) => {
    const { _id } = req.params;

    try {
        const product = await ProductModel.findById(_id).exec();
    } catch(error) {
        res.status(404).json({message:'Can not find the product'})
    }

    res.status(200).json(product)
}

// create product
const createProduct = async (req,res) => {
    const { title, price } = req.body
}

module.exports.getAllProducts = getAllProducts;
module.exports.getOneProduct = getOneProduct;