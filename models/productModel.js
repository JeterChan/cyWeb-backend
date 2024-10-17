const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    product_id:{
        type:String,
        required:true
    },
    title:{
        type:String,
    },
    price:{
        type:String,
        required:true
    },
    specification:{
        type:String,
    },
    description:{
        type:String,
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:'Category'
    },
    image:{
        data: Buffer,        // Store the image data as a Buffer
        contentType: String, // Store the image type (e.g., 'image/png', 'image/jpeg')
        filename: String,    // Store the image filename or other metadata
    }      
})

module.exports = mongoose.model('Product', productSchema);