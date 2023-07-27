const express = require('express');
const app = express();
const errorMiddleWare = require("./middleware/error");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
const corsOptions ={
    origin:'http://localhost:3000', 
    'Content-Type': 'Authorization',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(cors());

const product = require("./routes/productRouter");
const user = require("./routes/userRoute");
const order = require("./routes/orderRouter");

app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);

// middleware for error 
app.use(errorMiddleWare);

module.exports = app;