const path = require('path');
const Farm = require('../models/Farm');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const { request } = require('http');
const User = require('../models/User');

//@desc   Get all Farms
//@route  GET /api/v1/farms
//@access Public
exports.getFarms = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc   Get single Farm
//@route  GET /api/v1/farms/:id
//@access Public
exports.getFarm = asyncHandler(async (req, res, next) => {
  const farm = await Farm.findById(req.params.id);
  if (!farm) {
    //'id' doesn't exists in DB
    return next(
      new ErrorResponse(`Farm not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: farm });
});

//@desc   Update single Farm
//@route  PUT /api/v1/farms/:id
//@access Private
exports.updateFarm = asyncHandler(async (req, res, next) => {
  let farm = await Farm.findById(req.params.id);
  if (!farm) {
    return next(
      new ErrorResponse(`Farm not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is Farm owner
  if (farm.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not auhtarized to update this Farm`,
        401
      )
    );
  }
  farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: farm });
});

//@desc   Create a new Farm
//@route  POST /api/v1/farms
//@access Private
exports.createFarm = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for published Farm
  const publishedFarm = await Farm.findOne({ user: req.user.id });

  // if the user is not an admin
  if (publishedFarm && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with Id ${req.user.id} has already published a Farm`,
        400
      )
    );
  }

  const farm = await Farm.create(req.body);
  if (!farm) {
    return next(error);
  }
  res.status(201).json({ success: true, data: farm });
});

//@desc   Delete single Farm
//@route  DELETE /api/v1/farms/:id
//@access Private
exports.deleteFarm = asyncHandler(async (req, res, next) => {
  const farm = await Farm.findById(req.params.id);
  if (!farm) {
    return next(
      new ErrorResponse(`Farm not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is Farm owner
  if (farm.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not auhtarized to delete this Farm`,
        401
      )
    );
  }

  farm.remove();

  res.status(200).json({ success: true, data: {} });
});

//@desc   Add photo to Farm
//@route  PUT /api/v1/farms/:id/photo
//@access Private
exports.addPhotoToFarm = asyncHandler(async (req, res, next) => {
  const farm = await Farm.findById(req.params.id);
  if (!farm) {
    return next(
      new ErrorResponse(`Farm not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is Farm owner
  if (farm.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not auhtarized to update this Farm`,
        401
      )
    );
  }

  console.log(req);
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  file.name = `photo_${farm._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }

    await Farm.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});

//@desc   Get Farms in 'miles' radius of 'zipcode'
//@route  GET /api/v1/farms/radius/:zipcode/:miles
//@access Private
exports.findFarmInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, miles } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius in radian
  // Divide dist by radius of Earth
  // Earth raqdius = 3963 mi/ 6378 km

  const radius = miles / 3963;

  const farms = await Farm.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });
  res.status(200).json(res.advancedResults);
});

//@desc   Get publishers for Farm
//@route  GET /api/v1/farms/:id/publishers
//@access Private
exports.getPublishersForFarm = asyncHandler(async (req, res, next) => {
  const farm = await Farm.findById(req.params.id);
  if (!farm) {
    //'id' doesn't exists in DB
    return next(
      new ErrorResponse(`Farm not found with id of ${req.params.id}`, 404)
    );
  }

  const publishers = await User.find({ farm: req.params.id });

  res.status(200).json({ success: true, data: publishers });
});
