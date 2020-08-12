const path = require('path');
const Product = require('../models/Product');
const Farm = require('../models/Farm');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

//@desc   Get all Products
//@route  GET /api/v1/products
//@route  GET /api/v1/farms/:farmId/products
//@access Public

exports.getProducts = asyncHandler(async (req, res, next) => {
  if (req.params.farmId) {
    const products = await Product.find({ farm: req.params.farmId });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }

  //   next(error);
});

//@desc   Get specific Product
//@route  GET /api/v1/products/:id
//@access Public

exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'product',
    select: 'name',
  });

  if (!product) {
    return next(
      new ErrorResponse(`No product with id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: product,
  });
  //   next(error);
});

//@desc   Update single Product
//@route  PUT /api/v1/products/:id
//@access Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id).populate('farm', 'name');

  if (!product) {
    return next(
      new ErrorResponse(`No Product with id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is authorized to update products for Farm
  if (
    product.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    !req.user.farm
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update a product ${product._id}`,
        401
      )
    );
  }
  if (req.user.role === 'farm-publisher') {
    if (req.user.farm.toString() !== product.farm.toString()) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update a product ${product._id}`,
          401
        )
      );
    }
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
  });
});

//@desc   Create a new Product
//@route  POST /api/v1/farms/:farmId/products
//@access Private
exports.addProduct = asyncHandler(async (req, res, next) => {
  req.body.farm = req.params.farmId;
  req.body.user = req.user.id;

  const farm = await Farm.findById(req.params.farmId);

  if (!farm) {
    return next(
      new ErrorResponse(`No farm with id of ${req.params.farmId}`),
      404
    );
  }

  // Make sure user is authorized to Add to Farm
  if (
    farm.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    !req.user.farm
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a product to farm ${farm._id}`,
        401
      )
    );
  }
  if (req.user.role === 'farm-publisher') {
    if (req.user.farm.toString() !== farm.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add a product to farm ${farm._id}`,
          401
        )
      );
    }
  }

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    data: product,
  });
});

//@desc   Delete single Product
//@route  DELETE /api/v1/products/:id
//@access Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`No Product with id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is authorized to delete products for Farm
  if (
    product.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    !req.user.farm
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update a product ${product._id}`,
        401
      )
    );
  }
  if (req.user.role === 'farm-publisher') {
    if (req.user.farm.toString() !== product.farm.toString()) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update a product ${product._id}`,
          401
        )
      );
    }
  }
  await product.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

//@desc   Add photo to Product
//@route  PUT /api/v1/products/:id/photo
//@access Private
exports.addPhotoToProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is authorized to Add photo to Product
  if (
    product.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    !req.user.farm
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a product to farm ${farm._id}`,
        401
      )
    );
  }
  if (req.user.role === 'farm-publisher') {
    if (req.user.farm.toString() !== product.farm.toString()) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add a product to farm ${farm._id}`,
          401
        )
      );
    }
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404));
  }

  console.log(req.files);
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

  file.name = `photo_${product._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }

    await Product.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
