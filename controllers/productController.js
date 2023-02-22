const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
// this function for cath async error like when i post a new product but i didn't write product name but product name is require field then this function show the error or message 
const catchAsyncErrors = require('../middleware/catchAsynErrors');
const ApiFeatures = require("../utils/apiFeatures");


// create product -- admin

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    req.body.user = req.user.id;
    
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    });
});

// get all products 
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
      
    // pagination 

    const resultPerPage = 5;
    const productCount = await Product.countDocuments();


    const apiFeature = new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);

    const products = await apiFeature.query;

    res.status(200).json({
        success: true,
        products
    })
})

// get product details 
exports.getAllProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))

    }
    res.status(200).json({
        success: true,
        product,
        productCount

    });

})

// update product -- admin 

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }
    product = await Product.findByIdAndUpdate(req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });
    res.status(200).json({
        success: true,
        product
    })
})

// delete product -- admin 

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }
    await product.remove();
    res.status(200).json({
        success: true,
        message: "Product deleted",
    });
});