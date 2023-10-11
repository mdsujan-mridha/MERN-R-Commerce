const express = require('express');
const app = express();
const errorMiddleWare = require("./middleware/error");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const dotenv = require("dotenv");

// var xhr = new XMLHttpRequest();


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
const corsOptions = {
    origin:'https://panda-mern.netlify.app/',
    'Content-Type': 'Authorization',
    "Content-type":"application/json",
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(cors({
//     origin:'*',
//     methods:['POST','PUT','UPDATE','DELETE','OPTIONS','GET'],
//     credentials:true,
//     optionsSuccessStatus:200,
//     'Content-Type': 'Authorization',
// }));



dotenv.config({ path: "./config/config.env" });

const product = require("./routes/productRouter");
const user = require("./routes/userRoute");
const order = require("./routes/orderRouter");
const payment = require("./routes/paymentRouter");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

// middleware for error 
app.use(errorMiddleWare);

module.exports = app;