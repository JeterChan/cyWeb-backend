const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require("cors");
const expressLayouts = require('express-ejs-layouts');

// router
const productRouter = require('./routes/productRouter.js');
const apiRouter = require('./routes/apiRouter.js');

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(
    cors({
        origin:"*",
    })
);

const mongo = process.env.MONGODB;
mongoose.connect(mongo,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}) 
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("mongo connected");
});

// Set view engine to EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout','layouts/main');

// 設置靜態檔案目錄
app.use(express.static('public'));

// router path
app.get('/', (req, res) => {
    res.redirect('/product');
});
app.use('/product', productRouter);
app.use('/api', apiRouter);

app.listen(8080, () => {
    console.log('Server listening on "http://localhost:8080"');
});