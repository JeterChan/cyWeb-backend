const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const expressLayouts = require('express-ejs-layouts');
const passportConfig = require('./config/passport');
const flash = require('connect-flash');
const session = require('./middleware/session');
const morgan = require('morgan');
const csurf = require('csurf');

// router
const productRouter = require('./routes/productRouter.js');
const adminRouter = require('./routes/adminRouter.js');
const apiRouter = require('./routes/apiRouter');
const userRouter = require('./routes/userRouter');
const cartRouter = require('./routes/cartRouter');

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


// 根據目前的路由辨識要顯示的 navbar
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

// app.use((req, res, next) => {
//   console.log('session:', req.session.isPopulated);
//   console.log('user:', req.user);
//   next();
// });


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

app.listen(8080, () => {
    console.log('Server listening on "http://localhost:8080"');
});