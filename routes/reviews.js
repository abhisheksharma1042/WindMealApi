const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'farm user',
      select: 'averageRating name description',
    }),
    getReviews
  )
  .post(protect, authorize('client', 'admin'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('client', 'admin'), updateReview)
  .delete(protect, authorize('client', 'admin'), deleteReview);

module.exports = router;
