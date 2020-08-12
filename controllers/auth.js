const path = require('path');
const User = require('../models/User');
const Farm = require('../models/Farm');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

//@desc   Register user
//@route  POST /api/v1/auth/register
//@access Public
exports.register = asyncHandler(async (req, res, next) => {
  let farm = req.body.farm;
  // console.log(req);
  const { name, email, password, role } = req.body;

  // Each 'farm-publisher' must have a Farm field
  if (role === 'farm-publisher' && !farm) {
    console.log('farm-publisher does not have Farm'.red.inverse);
    return next(
      new ErrorResponse('farm-publisher role must have a farm field', 404)
    );
  } else if (role === 'farm-publisher' && farm) {
    //Create farm-publisher User
    farm = await Farm.findById(farm);

    if (!farm) {
      return next(
        new ErrorResponse(`farm-publisher role must have a correct farm field`),
        404
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      farm,
    });
    console.log('farm-publisher account created'.green.inverse);

    res.status(200).json({ success: true, data: user });
  } else {
    //Create User
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 200, res);
  }
});

//@desc   Login user
//@route  POST /api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req, res, next) => {
  // console.log(req.body);
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  //Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

//@desc   Log user out and remove cookie
//@route  GET /api/v1/auth/logout
//@access Private

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

//@desc   Get current logged in user
//@route  GET /api/v1/auth/login
//@access Private

exports.getMe = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('No user logged in', 400));
  }
  const user = await User.findById(req.user.id);
  const farm = await Farm.find({ user: user });
  const reviews = await Review.find({ user: user }).populate('farm');

  res.status(200).json({
    success: true,
    data: { user, farm, reviews },
  });
});

//@desc   Update User details
//@route  PUT /api/v1/auth/updatedetails
//@access Private

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc   Update Password
//@route  PUT /api/v1/auth/updatepassword
//@access Private

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check if current password match
  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@desc   Get currect logged in user
//@route  POST /api/v1/auth/forgotpassword
//@access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `https://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you 
  (or someone else) has requested the reset of a password. Link is only valid for 10 minutes.
  Please make a paste this link along with your email in in the reset password form. \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, info: 'Email sent' });
  } catch (error) {
    console.log(error);
    user.getResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

//@desc   Reset password
//@route  PUT /api/v1/auth/resetpassword/:resetToken
//@access Private
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

//@desc   Send encrypted token password back
//@route  GET /api/v1/auth/resetpassword/:resetToken
//@access Private
exports.getResetToken = asyncHandler(async (req, res, next) => {
  //Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }
  let resetToken = req.params.resetToken;

  res.status(200).json({ success: true, resetToken });
});

// Get token from model and create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
