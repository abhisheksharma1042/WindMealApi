const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

//@desc   Get all users
//@route  GET /api/v1/auth/users
//@access Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc   Get Single user
//@route  GET /api/v1/auth/users/:id
//@access Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(`User with id ${req.params.id} does not exist`)
    );
  }
  res.status(200).json({ success: true, data: user });
});

//@desc   Create user
//@route  Post /api/v1/auth/users
//@access Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  if (!user) {
    return next(new ErrorResponse(`User could not be created`));
  }
  res.status(201).json({ success: true, data: user });
});

//@desc   Update user
//@route  PUT /api/v1/auth/users/:id
//@access Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new ErrorResponse(`User could not be updated`));
  }
  res.status(200).json({ success: true, data: user });
});

//@desc   Delete user
//@route  DELETE /api/v1/auth/users/:id
//@access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
