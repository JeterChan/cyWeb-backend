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
        type:String,
        default:""
    }      
})

module.exports = mongoose.model('Product', productSchema);