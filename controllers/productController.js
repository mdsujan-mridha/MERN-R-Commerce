const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
// this function for cath async error like when i post a new product but i didn't write product name but product name is require field then this function show the error or message 
const catchAsyncErrors = require('../middleware/catchAsynErrors');
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

// create product -- admin

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    let images = [];
    if(typeof req.body.images === "string"){
        images.push(req.body.images);
    }else{
        images = req.body.images;
    }
    const imageLink = [];
    for(let i = 0;i<images.length;i++){
        const result = await cloudinary.v2.uploader.upload(images[i],{
            folder:"products",
        });
        imageLink.push({
            public_id:result.public_id,
            url:result.secure_url,
        });
    }
    req.body.images = imageLink;
    req.body.user = req.user.id;
    
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    });
});

// get all products 
exports.getAllProducts = catchAsyncErrors(async (req, res,next) => {
      
    // return next(new ErrorHandler("This is my temp error",500));
    // pagination 

    const resultPerPage = 4;
    const productsCount = await Product.countDocuments();


    const apiFeature = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter();

    let products = await apiFeature.query;
    let filteredProductsCount = products.length;
    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query.clone();

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
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
        // productsCount

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

// Create new review or update the review 
exports.createProductReview = catchAsyncErrors(async(req,res,next) =>{
     const{rating,comment,productId} = req.body;
     const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
     };

     const product = await Product.findById(productId);
     const isReviewed = product.reviews.find( 
        (rev) => rev.user.toString() === req.user._id.toString()
        );
      
      if(isReviewed){
         product.reviews.forEach((rev) =>{
             if(rev.user.toString() === req.user._id.toString())
             (req.rating = rating),(rev.comment = comment);
         });

      } else{
         product.reviews.push(review);
         product.numOfReviews = product.reviews.length;
      } 
     let avg = 0;
     product.reviews.forEach((rev) =>{
         avg +=rev.rating;
     });
     product.ratings = avg / product.reviews.length;
     
     await product.save({validateBeforeSave:false });


     res.status(200).json({
        success:true,
     })

});


// get all product review

exports.getProductReviews = catchAsyncErrors(async(req,res,next) =>{
     const product = await Product.findById(req.query.id);
    //   here i use query bcz I need to find review from product object 
    if(!product){
         return next(new ErrorHandler(`Product not found` ,404));
    }
  
    res.status(200).json({
         success:true,
         reviews:product.reviews,
    })
});

// delete product reviews 

exports.deleteReview = catchAsyncErrors(async(req,res,next) =>{
     const product = await Product.findById(req.query.productId);
     if(!product) {
         return next(new ErrorHandler(`product not found`, 404));
     }
     const reviews = product.reviews.filter(
        (rev) =>rev._id.toString() !== req.query.id.toString()
     );

     let avg = 0;
     reviews.forEach((rev) =>{
        avg+=rev.rating;
     });
    let ratings = 0;
    if(reviews.length ===0){
         ratings =0;
    } else{
        ratings = avg/reviews.length;

    }

    const numOfReviews = reviews.length;
    await Product.findByIdAndUpdate(
         req.query.productId,
         {
            reviews,
            ratings,
            numOfReviews,
         },
         {
            new:true,
            runValidators:true,
            useFindAndModify:false
         }

    );
    res.status(200).json({
        success:true,
    });
});

// get all product by admin 

exports.getAdminProduct  = catchAsyncErrors(async(req,res,next) =>{
     const products = await Product.find();

     res.status(200).json({
        success:true,
        products,
     })
})