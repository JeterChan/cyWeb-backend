const Product = require('../models/productModel');

const getImage = async (req ,res) => {
    try{
        const product = await Product.findOne({product_id:req.params.productId});
        if (!product || !product.image || !product.image.data) {
            return res.status(404).send('Image not found');
        }

        res.contentType(product.image.contentType);
        res.send(product.image.data);
    }catch(error) {
        console.error('Error retrieving image', error);
        res.status(500).send('Server error');
    }
}

module.exports = { 
    getImage
};