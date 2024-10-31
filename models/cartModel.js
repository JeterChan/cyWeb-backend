const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user_id:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
},{
    timestamps:true
})

module.exports = mongoose.model('cart', cartSchema);