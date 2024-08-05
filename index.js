const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
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

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.listen(8080, () => {
    console.log('Server listening on "http://localhost:8080"');
});