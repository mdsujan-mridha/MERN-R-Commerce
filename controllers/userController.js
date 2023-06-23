const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const cloudinary = require("cloudinary");
// this function for cath async error like when i post a new product but i didn't write product name but product name is require field then this function show the error or message 
const catchAsyncErrors = require('../middleware/catchAsynErrors');

const sendToken = require("../utils/jwtToken");

const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
// register new user 
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    
  const mycloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
    folder:"avater",
    width:150,
    crop:"scale",
  })
    
  const { name, email, password } = req.body;
  const user = await User.create({
    name, email, password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    }
  });

  sendToken(user, 201, res);


});


// login 
exports.loginUser = catchAsyncErrors(async (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("plz Enter valid email & password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("invalid email or password", 401));
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
      subject: `E-commerce Password Recovery`,
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


// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not password", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// get user details 
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  })

});


// update user password 

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match", 400));

  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);

})
// update user profile

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  //  add cloudinary 
  if(req.body.avatar !== ""){
     const user = await User.findById(req.user.id);
     const imageId = user.avatar.public_id;
     await cloudinary.v2.uploader.destroy(imageId);
     const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
      folder: "avater",
      width:150,
      crop:"scale",
     });
    newUserData.avatar ={
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    }; 
  }
  const user = await User.findOneAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
    user,
  })

});

// get all user by admin

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  })
})

//  get single user by admin 

exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`user does not exist id :${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    user,
  })
});

// update user role 
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});



// DELETE USER

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  // there user params bcz this request will send by admin bt is this request will send bt user then i write (req.user.id)
  if (!user) {
    {
      return next(new ErrorHandler(`User does not exist with id : ${req.params.id}`, 400));
    }
  }
  await user.remove();
  res.status(200).json({
    success: true,
    message: "user deleted Successfully",
  })
})