const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const { Op } = require('sequelize');
const {getProductsData} = require('../services/productService');

// 模擬資料庫模型
const db = require('../db/models');
const Product = db.Product;
const Category = db.Category;
const Subcategory = db.Subcategory;

describe('getProductsData Service', () => {
    // 測試之前的操作
    beforeEach(() => {
        sinon.restore();
    });

    it('沒有參數時應該回傳所有商品', async() => {
        const mockProducts = [{ id:1, name: 'Product 1' }, { id:2, name: 'Product 2' }];
        sinon.stub(Product, 'findAndCountAll').resolves({ count: 2, rows: mockProducts});
        sinon.stub(Category, 'findAll').resolves([]);

        const data = await getProductsData();
        expect(data.products).to.deep.equal(mockProducts);
        expect(data.totalCount).to.equal(2);
        expect(Product.findAndCountAll.calledOnce).to.be.true;
        expect(Product.findAndCountAll.calledWithMatch({ limit:12, offset:0}));
    });

    it('根據 categorySlug 回傳商品和子類別', async () => {
        const mockCategory = {
            id: 1, name: 'Electronics', slug: 'electronics',
            subcategories: [{ id: 101, name: 'Smartphones' }, { id: 102, name: 'Laptops' }]
        };
        const mockProducts = [{ id: 3, name: 'iPhone' }];
        sinon.stub(Category, 'findOne').resolves(mockCategory);
        sinon.stub(Product, 'findAndCountAll').resolves({ count: 1, rows: mockProducts });
        sinon.stub(Category, 'findAll').resolves([]);

        const data = await getProductsData('electronics', null, 1);
        expect(data.products).to.deep.equal(mockProducts);
        expect(data.subcategories).to.deep.equal(mockCategory.subcategories);
        expect(Category.findOne.calledWithMatch({ where: { slug: 'electronics' } })).to.be.true;
        expect(Product.findAndCountAll.calledWithMatch({
            where: { subcategoryId: { [Op.in]: [101, 102] } }
        })).to.be.true;
    });
})
