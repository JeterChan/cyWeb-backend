const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const { getProducts } = require('../controllers/productController');
const productService = require('../services/productService');
const { signedCookie } = require('cookie-parser');

describe('productController.getProducts', () => {
    let req;
    let res;
    let statusStub;
    let jsonStub;
    let renderStub;
    let redirectStub;
    let flashStub;
    let getProductsDataStub; // 模擬 service 層的函數

    beforeEach(() => {
        // arrange for all tests
        // 模擬 req
        req = {
            query: {},
            session: { cart: [] },
            isAuthenticated: sinon.stub().returns(true), // 假設使用者已登入
            flash: sinon.stub()
        };

        // 模擬 res 物件和其方法
        jsonStub = sinon.stub();
        statusStub = sinon.stub().returns({ json: jsonStub});
        renderStub = sinon.stub();
        redirectStub = sinon.stub();
        res = {
            status: statusStub,
            json: jsonStub,
            render: renderStub,
            redirect: redirectStub
        };

        // Stub Service 層的方法
        getProductsDataStub = sinon.stub(productService, 'getProductsData');
    });

    afterEach(() => {
        sinon.restore(); // 恢復所有 stub
    })

    // Test case
    it('應該正確解析參數並呼叫 Service layer', async () => {
        // Arrange, 此test case 的準備
        req.query.category = 'electronics';
        req.query.page = '2';
        getProductsDataStub.resolves({
            products: [{ id: 1, name: 'Product 1' }],
            categories: [],
            subcategories: [],
            currentPage: 2,
            totalPages: 5
        });

        // Act, 執行要測試的函式
        await getProducts(req, res);

        // Assert, 驗證結果
        expect(getProductsDataStub.calledOnce).to.be.true;
        expect(getProductsDataStub.calledWith('electronics', undefined, '2')).to.be.true;
        
        // res.render 應該被呼叫
        expect(res.render.calledOnce).to.be.true;
    });

    it('沒有傳遞參數時, 應該呼叫 Service layer 並渲染產品列表頁面', async () => {
        // Arrange
        const mockServiceData = {
            products: [{ id: 1, name: 'Product 1' }],
            categories: [{ id: 1, name: 'Category 1', slug: 'category-1' }],
            subcategories: [],
            currentPage: 1,
            totalPages: 1,
            totalCount: 1,
            currentCategoryData: null
        };
        getProductsDataStub.resolves(mockServiceData); // Service layer 回傳成功數據

        // Act
        await getProducts(req,res);

        // Assert
        expect(getProductsDataStub.calledOnce).to.be.true;

        expect(getProductsDataStub.calledWith(undefined, undefined,1)).to.be.true;

        expect(res.render.calledOnce).to.be.true;

        expect(res.render.calledWith('products/productList', sinon.match({
            products: mockServiceData.products,
            categories: mockServiceData.categories,
            currentCategory: '',
            currentSubcategory: '',
            subcategories: mockServiceData.subcategories,
            currentPage: mockServiceData.currentPage,
            totalPages: mockServiceData.totalPages,
            selectedCategory: undefined,
            cart: req.session.cart,
            cartItemCount: req.session.cart.length,
            isAuthenticated: req.isAuthenticated(),
        }))).to.be.true;

        expect(statusStub.notCalled).to.be.true; // 確保沒有呼叫 res.status
        expect(jsonStub.notCalled).to.be.true; // 確保沒有呼叫 res.json
        expect(redirectStub.notCalled).to.be.true; // 成功響應不應重定向
    });

    it('有 categorySlug 參數時, 應該呼叫 Service layer 並 render product list view', async () => {
        // Arrange
        req.query.category = 'electronics';
        const mockServiceData = {
            products: [{ id:2, name: 'Laptop', categorySlug: 'electronics' }],
            categories: [{ id: 101, name: 'Electronics', slug: 'electronics' }],
            subcategories: [{ id: 201, name: 'Gaming Laptops', slug: 'gaming-laptops' }],
            currentPage: 1,
            totalPages: 1,
            totalCount: 1,
            currentCategoryData: null
        };
        getProductsDataStub.resolves(mockServiceData); // 模擬 Service 層回傳數據

        // Act
        await getProducts(req, res);

        // Assert
        expect(getProductsDataStub.calledOnce).to.be.true;
        expect(getProductsDataStub.calledWith('electronics', undefined, 1)).to.be.true;

        expect(res.render.calledOnce).to.be.true;
        expect(res.render.calledWith('products/productList', sinon.match({
            products: mockServiceData.products,
            currentCategory: 'electronics',
            currentSubcategory: '',
            currentPage: mockServiceData.currentPage,
            totalPages: mockServiceData.totalPages,
            selectedCategory: 'electronics'
        }))).to.be.true;
    });

    it('有 categorySlug 和 subcategorySlug 參數時, 應該呼叫 service layer 並 render views', async () => {
        // Arrange
        req.query.category = 'electronics';
        req.query.subcategory = 'gaming-laptops';
        const mockServiceData = {
            products: [{ id: 3, name: 'Gaming Laptop', categorySlug: 'electronics', subcategorySlug: 'gaming-laptops' }],
            categories: [{ id: 102, name: 'Electronics', slug: 'electronics' }],
            subcategories: [{ id: 202, name: 'Gaming Laptops', slug: 'gaming-laptops' }],
            currentPage: 1,
            totalPages: 1,
            totalCount: 1,
            currentCategoryData: null
        };
        getProductsDataStub.resolves(mockServiceData); // 模擬 Service 層回傳數據

        // Act
        await getProducts(req, res);

        // Assert
        expect(getProductsDataStub.calledOnce).to.be.true;
        expect(getProductsDataStub.calledWith('electronics', 'gaming-laptops', 1)).to.be.true;

        expect(res.render.calledOnce).to.be.true;
        expect(res.render.calledWith('products/productList', sinon.match({
            products: mockServiceData.products,
            currentCategory: 'electronics',
            currentSubcategory: 'gaming-laptops',
            currentPage: mockServiceData.currentPage,
            totalPages: mockServiceData.totalPages,
            selectedCategory: 'electronics'
        }))).to.be.true;
    });

    it('If service layer returns null, should return 404', async() => {
        // Arrange
        req.query.category = 'non-existent-category';
        getProductsDataStub.resolves(null); // 模擬 Service 層回傳 null

        // Act
        await getProducts(req, res);

        // Assert
        expect(getProductsDataStub.calledOnce).to.be.true;
        expect(getProductsDataStub.calledWith('non-existent-category', undefined, 1)).to.be.true;

        expect(statusStub.calledOnceWith(404)).to.be.true; // 確保回傳 404 狀態碼
        expect(jsonStub.calledOnceWith({ status: 'error', message: '找不到指定的類別' })).to.be.true;

        expect(res.render.notCalled).to.be.true; // 確保沒有渲染視圖
        expect(redirectStub.notCalled).to.be.true; // 確保沒有重定向
    });

    it('Service layer 錯誤, return status code 500 and json error message', async() => {
        //Arrange
        const testError = new Error('Database connection failed');
        getProductsDataStub.rejects(testError); // Service layer 拋出錯誤

        // Act
        await getProducts(req, res);

        // Assert
        expect(getProductsDataStub.calledOnce).to.be.true;
        expect(getProductsDataStub.calledWith(undefined, undefined, 1)).to.be.true;
        expect(statusStub.calledOnceWith(500)).to.be.true; // 確保回傳 500 狀態碼
        expect(jsonStub.calledOnce).to.be.true;
        expect(jsonStub.calledWith({ 
            status: 'error', 
            message: testError.message 
        })).to.be.true;

        expect(res.render.notCalled).to.be.true; // 確保沒有渲染視圖
        expect(redirectStub.notCalled).to.be.true; // 確保沒有重定向
        expect(req.flash.notCalled).to.be.true; // 確保沒有使用 flash
    });
})