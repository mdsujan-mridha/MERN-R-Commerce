const express = require('express');
const app = express();
const errorMiddleWare = require("./middleware/error");
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

const product = require("./routes/productRouter");
const user = require("./routes/userRoute");

app.use("/api/v1",product);
app.use("/api/v1",user)

// middleware for error 
app.use(errorMiddleWare);

module.exports = app;