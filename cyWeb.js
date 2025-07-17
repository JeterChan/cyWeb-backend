const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('./middleware/session');
const morgan = require('morgan');


// swagger
// development only
if(process.env.NODE_ENV === 'development') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./swagger.js');
  // swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


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

if(process.env.NODE_ENV === 'production'){
  app.set('trust proxy', 1);
}

// session config
app.use(session)
// 初始化並配置 Passport
// init passport module
app.use(passport.initialize());
app.use(passport.session());
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

// 404 page
app.use((req, res, next) => {
  res.status(404).render('404');
});


app.listen(process.env.PORT || 8080);