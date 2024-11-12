const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passportConfig = require('./config/passport');
const flash = require('connect-flash');

// router
const productRouter = require('./routes/productRouter.js');
const adminRouter = require('./routes/adminRouter.js');
const apiRouter = require('./routes/apiRouter');
const authRouter = require('./routes/userRouter');

dotenv.config();

const app = express();

// middleware
const setLocals = require('./middleware/locals');

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// authentication
app.use(session({
    secret:'cyWebScrotum',
    resave:false,
    saveUninitialized:true
}))

// 初始化並配置 Passport
passportConfig(app);
app.use(flash())
app.use(setLocals);

// 跨域
app.use(
    cors({
        origin:"*",
    })
);

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
app.use('/users', authRouter);
// product route (public route)
app.use('/products', productRouter);
// admin route (private route)
app.use('/admin', adminRouter);
// api route
app.use('/api/v1', apiRouter);

app.listen(8080, () => {
    console.log('Server listening on "http://localhost:8080"');
});