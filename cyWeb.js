const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const expressLayouts = require('express-ejs-layouts');
const passportConfig = require('./config/passport');
const flash = require('connect-flash');
const session = require('./middleware/session');
const morgan = require('morgan');
const csurf = require('csurf');

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

dotenv.config();

const app = express();

// middleware
const setLocals = require('./middleware/locals');

// use morgan for logging
app.use(morgan('tiny'))
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
    res.redirect('/products/catalog/A');
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

app.listen(8080, () => {
    console.log('Server listening on "http://localhost:8080"');
    console.log('Swagger API docs at http://localhost:8080/api-docs');
});