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
         review:product.reviews,
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
      

})