const { ModifiedPathsSnapshot } = require('mongoose');
const ProductModel = require('../models/productModel');
const ImageModel = require('../models/imageModel');

// CRUD api
// get all product
const getAllProducts = async (req, res) => {
    try {
        const products = await roductModel.find();
        res.status(200).json(products)
    } catch(error) {
        res.status(500).json({message:error.message})
    }

}

// read one product
const getOneProduct = async (req,res) => {
    const { _id } = req.params;

    try {
        const product = await ProductModel.findById(_id).exec();
        res.status(200).json(product)
    } catch(error) {
        res.status(404).json({message:'Can not find the product'})
    }   
}

// create product
const createProduct = async (req,res) => {
    try {
        const product = await ProductModel.create(req.body);
        res.status(200).json(product);
    } catch(error) {
        res.status(500).json({message:error.message});
    }
}

// update product info
const updateProduct = async (req,res) => {
    try {
        const { _id } = req.params;
        const product = await ProductModel.findByIdAndUpdate(_id, req.body);

        if(!product) {
            return res.status(404).json({message:"Product not found"});
        }

        const updatedProduct = await ProductModel.findById(_id);
        res.status(200).json(updatedProduct);

    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

//delete product 
const deleteProduct = async (req,res) => {
    try {
        const { _id } = req.params;
        const product = await productModel.findByIdAndDelete(_id);

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
    try {
        const image = {
            data: req.file.buffer,          // Image buffer
            contentType: req.file.mimetype, // Image type (e.g., 'image/png')
            filename: req.file.originalname // Original file name
        }; 
        await ImageModel.create(image);
        res.status(200).json({message:'Upload success!'});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

// read image
const readImage = async (req, res) => {
    try {
        const image = await ImageModel.findById(req.params._id);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.set('Content-Type', 'image/jpg');
        res.status(200).send(image.data);
    } catch (error) {
        res.status(404).json({message:error.message});
    }
}

module.exports = { 
    getAllProducts, 
    getOneProduct, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    uploadImage,
    readImage
};
