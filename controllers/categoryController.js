const { Category, Subcategory } = require('../db/models');

// create Category
const createCategory = async(req, res) => {
    
    try {
        const { name, slug }  = req.body;

        if (!name || !slug) {
            return res.status(404).json({message:"No Category added."});
        }

        const newCategory = await Category.create({
            name:name,
            slug:slug
        })
    
        res.status(200).json({
            message:"Create Category successfully!",
            Category:newCategory
        })
    } catch(error){
        res.status(500).json({message:error.message});
    }
}

// create Subcategory
const createSubcategory = async (req, res) => {
    try {
        const { category_id, name, slug } = req.body;

        if(!category_id || !name || !slug) {
            return res.status(404).json({message:"Do not match the necessary information of Subcategory"});
        }

        const newSubcategory = await Subcategory.create({
            categoryId:category_id,
            name:name,
            slug:slug
        })

        res.status(200).json({
            message:"Create Subcategory successfully!",
            Subcategory:newSubcategory
        });
    } catch(error) {
        res.status(500).json({message:error.message});
    }
}

// get all category
const getAllCategory = async(req, res) => {
    try {
        const categories = await Category.findAll();

        if(!categories) {
            return res.status(404).json({
                status:'error',
                message:'類別不存在'
            })
        }

        res.status(200).json({
            status:'success',
            data:categories
        })
    } catch (error) {
        res.status(500).json({
            status:'error',
            error:error.message
        })
    }
}

// get subcategories
const getSubcategories = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const category = await Category.findOne({
            where:{name:categoryName},
            include:[{
                model:Subcategory,
                as:'subcategories',
                attributes:['name']
            }]
        }); 

        if(!category) {
            return res.status(404).json({
                status:'error',
                message:'此類別未存在'
            })
        }

        res.status(200).json({
            status:'success',
            data:category,
            test:category.subcategories[0].name
        })
    } catch (error) {
        res.status(500).json({
            status:'error',
            error:error.message
        })
    }
}

module.exports = {
    createCategory,
    createSubcategory,
    getAllCategory,
    getSubcategories
};