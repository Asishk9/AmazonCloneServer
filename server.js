require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const DefaultData = require("./defaultdata");
require("./db/conn");
const router = require("./routes/router");
const products = require("./models/productsSchema");
const jwt = require("jsonwebtoken");
const cors = require("cors");


const port = process.env.PORT || 8005;

// middleware
app.use(express.json());
app.use(cookieParser(""));

app.use(router);
app.use(cors(
    {
        origin: "http://localhost:3000"
    }
));

app.listen(port,()=>{
    console.log(`your server is running on port ${port} `);
});

DefaultData();