const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    cart_id:{
        type:Schema.Types.ObjectId,
        ref:'Cart'
    },
    product_id:{
        type:Schema.Types.ObjectId,
        ref:'Product'
    },
    quantity:{
        type:Number,
        required:true
    }
},{
    timestamps:true
})

module.exports = mongoose.model('cartItem', cartItemSchema);