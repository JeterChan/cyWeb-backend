const Category = require('../models/categoryModel');
const SubCategory = require('../models/subCategoryModel')

// create Category
const addNewCategory = async(req, res) => {
    
    try {
        const { name }  = req.body;

        if (!name) {
            return res.status(404).json({message:"No Category added."});
        }

        const newCategory = await Category.create({
            name:name
        })
    
        res.status(200).json({
            message:"Create Category successfully!",
            Category:newCategory
        })
    } catch(error){
        res.status(500).json({message:error.message});
    }
}

module.exports = {
    addNewCategory
};