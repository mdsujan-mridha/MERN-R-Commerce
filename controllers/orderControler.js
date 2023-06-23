const catchAsyErrors = require("../middleware/catchAsynErrors");
const Order = require('../models/orderModel');
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");

// create new order 
exports.newOrder = catchAsyErrors(async (req, res, next) => {
    //  get order info from client side 
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
    // create order on database 
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    });
});

// get a single order 

exports.getSingleOrder = catchAsyErrors(async (req, res, next) => {
    // The populate() method allows developers to simply refer to a document inside a different collection to another document's field that resides in a different field. 
    const order = await Order.findById(req.params.id).populate("user", "name email");

    // console.log(order);
    if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
    }
    res.status(200).json({
        success: true,
        order,
    })
})

// get all order items 
// all order items only can see admin  
exports.getAllOrders = catchAsyErrors(async (req, res, next) => {

    const orders = await Order.find();
    let totalAmount = 0;
    // total amount will increase with each and every items 
    orders.forEach((order) => {
        {
            totalAmount += order.totalPrice;
        }
    });
    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    })

});

// get logged user order 
exports.myOrders = catchAsyErrors(async (req, res, next) => {

    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        orders,
    });
});


//   delete order by admin 

exports.deleteOrder = catchAsyErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler(`Order not found with is id`, 404));
    }
    await order.remove();
    res.status(200).json({
        success: true,

    })
});


// update order status by admin 

exports.updateOrder = catchAsyErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler(`Order not found with is id`, 404));
    }
    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("You have already delivered this order", 400));


    }

    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
            await updateStock(o.product, o.quantity);
        });
    }
    order.orderStatus = req.body.status;
    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }
    await order.save({validateBeforeSave:false });
     res.status(200).json({
         success:true,
     });
});

async function updateStock(id,quantity){
    const product = await Product.findById(id);
    product.Stock -= quantity;
   await product.save({validateBeforeSave:false });
}
