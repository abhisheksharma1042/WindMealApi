const express = require('express');
const {
  getProducts,
  getProduct,
  addProduct,
  deleteProduct,
  updateProduct,
  addPhotoToProduct,
} = require('../controllers/products');

const Product = require('../models/Product');
const advancedResults = require('../middleware/advancedResults');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(Product, { path: 'product', select: 'name' }),
    getProducts
  )
  .post(protect, authorize('farmer', 'farm-publisher'), addProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('farmer', 'farm-publisher'), updateProduct)
  .delete(protect, authorize('farmer', 'farm-publisher'), deleteProduct);

// router.route('/radius/:zipcode/:miles').get(findProductInRadius);

router
  .route('/:id/photo')
  .put(protect, authorize('farmer', 'farm-publisher'), addPhotoToProduct);

module.exports = router;
