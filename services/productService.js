// services/productService.js
const { Product, Category, Subcategory } = require('../db/models'); // 假設這是你的模型
const { Op } = require('sequelize'); // 用於 Sequelize 的操作符

const PRODUCT_PER_PAGE = 12;

const getProductsData = async (categorySlug, subcategorySlug, page = 1) => {
    const currentPage = parseInt(page);
    const perPage = PRODUCT_PER_PAGE;

    let products = [];
    let totalCount = 0;
    let subcategories = [];
    let currentCategoryData = null; // 用於儲存當前類別數據，以便取出其子類別

    // 1. 查詢所有類別 (用於 Navbar)
    const categories = await Category.findAll();

    // 2. 根據 subcategorySlug 查詢
    if (subcategorySlug) {
        const subcategory = await Subcategory.findOne({ where: { slug: subcategorySlug } });
        if (!subcategory) {
            // 如果子類別不存在，回傳空數據表示找不到
            return { products: [], totalCount: 0, subcategories: [], categories, currentPage, totalPages: 0, currentCategoryData: null };
        }

        const { count, rows } = await Product.findAndCountAll({
            where: { subcategoryId: subcategory.id },
            limit: perPage,
            offset: (currentPage - 1) * perPage,
        });
        products = rows;
        totalCount = count;

        // 獲取該 subcategory 所屬的 category 的所有子類別
        currentCategoryData = await Category.findOne({
            where: { slug: categorySlug },
            include: [{ model: Subcategory, as: 'subcategories', attributes: ['id', 'name', 'slug'] }]
        });
        if (currentCategoryData) {
            subcategories = currentCategoryData.subcategories;
        }

    } else if (categorySlug) { // 3. 根據 categorySlug 查詢 (無 subcategorySlug)
        currentCategoryData = await Category.findOne({
            where: { slug: categorySlug },
            include: [{ model: Subcategory, as: 'subcategories', attributes: ['id', 'name', 'slug'] }]
        });

        if (!currentCategoryData) {
            return null; // 表示找不到指定類別，由控制器處理 404
        }

        const subcategoryIds = currentCategoryData.subcategories.map(sub => sub.id);
        subcategories = currentCategoryData.subcategories;

        const { count, rows } = await Product.findAndCountAll({
            where: { subcategoryId: { [Op.in]: subcategoryIds } },
            limit: perPage,
            offset: (currentPage - 1) * perPage,
            include: [{ model: Subcategory, as: 'subcategory', attributes: ['id', 'name'], include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }] }]
        });
        products = rows;
        totalCount = count;

    } else { // 4. 無 categorySlug 和 subcategorySlug 查詢所有商品
        const { count, rows } = await Product.findAndCountAll({
            limit: perPage,
            offset: (currentPage - 1) * perPage,
        });
        products = rows;
        totalCount = count;
    }

    const totalPages = Math.ceil(totalCount / perPage);

    return {
        products,
        totalCount,
        subcategories,
        categories,
        currentPage,
        totalPages,
        currentCategoryData // 額外回傳當前類別數據，控制器可能需要其 slug 等信息
    };
};

module.exports = { getProductsData };