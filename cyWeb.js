const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const expressLayouts = require('express-ejs-layouts');
const passportConfig = require('./config/passport');
const flash = require('connect-flash');
const session = require('./middleware/session');
const morgan = require('morgan');
const csurf = require('csurf');
const fs = require('fs');
const path = require('path');

// swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');

// router
const productRouter = require('./routes/productRouter.js');
const adminRouter = require('./routes/adminRouter.js');
const apiRouter = require('./routes/apiRouter');
const userRouter = require('./routes/userRouter');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/orderRouter.js');

// test
const testRouter = require('./routes/testRouter.js');

const app = express();

// middleware
const setLocals = require('./middleware/locals');



// session config
app.use(session)
// 初始化並配置 Passport
passportConfig(app);
app.use(flash())
app.use(setLocals);

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout','layouts/main');

// 設置靜態檔案目錄
app.use(express.static('public'));

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// router path
app.get('/', (req, res) => {
    res.redirect('/products');
});

// auth router
app.use('/users', userRouter);
// product route (public route)
app.use('/products', productRouter);
// admin route (private route)
app.use('/admin', adminRouter);
// api route
app.use('/api/v1', apiRouter);
// cart route
app.use('/cart', cartRouter);
// order route
app.use('/orders', orderRouter);
//test
app.use('/test', testRouter);
// 在你的 app.js 中
const db = require('./models'); // 調整為你的 models 目錄路徑

// 測試 db 對象載入
app.get('/debug-db-object', async (req, res) => {
  try {
    console.log('🔹 檢查 db 對象');
    
    // 檢查 sequelize 實例
    console.log('🔹 Sequelize 實例存在:', !!db.sequelize);
    console.log('🔹 可用的模型:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));
    
    // 測試連線
    await db.sequelize.authenticate();
    console.log('✅ Sequelize 連線成功');
    
    res.json({
      sequelize: 'OK',
      models: Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('❌ db 對象測試失敗:', error);
    res.status(500).json({ 
      error: error.message,
      name: error.name,
      config: 'check console logs'
    });
  }
});



// 404 page
app.use((req, res, next) => {
  res.status(404).render('404');
});


app.listen(process.env.PORT, () => {
    console.log(`Server listening on "http://localhost:${process.env.PORT}"`);
    console.log(`Swagger API docs at "http://localhost:${process.env.PORT}/api-docs"`);
});