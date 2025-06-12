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

app.get('/debug-env', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    hasRedisUrl: !!process.env.REDIS_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    // trustProxy: app.get('trust proxy')
  });
});

app.get('/test-ssr-session', (req, res) => {
  console.log('🔹 SSR Session 完整測試');
  
  // 增加訪問計數
  if (!req.session.visits) {
    req.session.visits = 0;
  }
  req.session.visits++;
  req.session.lastVisit = new Date();
  
  // 檢查 cookie 設置
  const cookieSettings = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  };
  
  console.log('Session ID:', req.sessionID);
  console.log('Session 數據:', req.session);
  console.log('Cookie 設置:', cookieSettings);
  
  res.json({
    success: true,
    sessionId: req.sessionID,
    visits: req.session.visits,
    lastVisit: req.session.lastVisit,
    cookieSettings,
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});
// 404 page
app.use((req, res, next) => {
  res.status(404).render('404');
});


app.listen(process.env.PORT, () => {
    console.log(`Server listening on "http://localhost:${process.env.PORT}"`);
    console.log(`Swagger API docs at "http://localhost:${process.env.PORT}/api-docs"`);
});