const mongoose = require('mongoose');


const subCategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mainCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updateAt:{
        type:Date,
        default:Date.now
    }
});

subCategorySchema.pre('save', function(next) {
    this.updateAt = Date.now();
    next();
});

const subCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = {
    subCategory
};