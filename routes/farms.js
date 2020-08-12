const express = require('express');
const {
  getFarms,
  getFarm,
  createFarm,
  deleteFarm,
  updateFarm,
  addPhotoToFarm,
  findFarmInRadius,
  getPublishersForFarm,
} = require('../controllers/farms');

const Farm = require('../models/Farm');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const productRouter = require('./products');
const reviewRouter = require('./reviews');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:farmId/products', productRouter);
router.use('/:farmId/reviews', reviewRouter);

router
  .route('/')
  .get(advancedResults(Farm, 'products'), getFarms)
  .post(protect, authorize('farmer'), createFarm);

router
  .route('/:id')
  .get(getFarm)
  .put(protect, authorize('farmer'), updateFarm)
  .delete(protect, authorize('farmer'), deleteFarm);

router.route('/radius/:zipcode/:miles').get(findFarmInRadius);

router
  .route('/:id/photo')
  .put(protect, authorize('farmer'), addPhotoToFarm)
  .post(protect, authorize('farmer'), addPhotoToFarm);
router
  .route('/:id/publishers')
  .get(protect, authorize('farmer'), getPublishersForFarm);

module.exports = router;
