const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
// this function for cath async error like when i post a new product but i didn't write product name but product name is require field then this function show the error or message 
const catchAsyncErrors = require('../middleware/catchAsynErrors');

const sendToken = require("../utils/jwtToken");

const sendEmail = require("../utils/sendEmail");

// register new user 
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password, avatar } = req.body;
    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "This is a sample id",
            url: "profilePicUrl",
        }
    });

    sendToken(user, 201, res);


});


// login 
exports.loginUser = catchAsyncErrors(async(req,res,next) =>{
      
  const { email, password } = req.body;
     
   if(!email || !password){
     return next(new ErrorHandler("plx Enter valid email & password",400));
   }

   const user =await User.findOne({email}).select("+password");

    if(!user){
      return next(new ErrorHandler("invalid email or password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, res);

})


// logout 
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});