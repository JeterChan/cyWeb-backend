const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require("cors");

// router
const productRouter = require('./routes/productRouter.js')

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

app.use('/api/product', productRouter);

app.listen(8080, () => {
    console.log('Server listening on "http://localhost:8080"');
});