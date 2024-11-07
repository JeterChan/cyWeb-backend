const { Product } = require('../db/models')

// get all products
const getProducts = async(req, res) => {
    try {
        const products = await Product.findAll()
        return res.status(200).json({
            status:'success',
            data:products
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

        const product = await Product.findAll({
            where:{
                productNumber:productNumber
            }
        });

        return res.status(200).json({
            status:'success',
            data:product
        });
        
    } catch (error) {
        res.status(500).json({
            status:'error',
            message:error.message
        })
    }
}

module.exports = {
    getProducts,
    getOneProduct
}