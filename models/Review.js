const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Prevent user from submitting more than one review per farm
ReviewSchema.index(
  { farm: 1, user: 1 },
  { unique: [true, 'You can only write one review for each farm'] }
);

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (farmId) {
  const obj = await this.aggregate([
    {
      $match: { farm: farmId },
    },
    {
      $group: {
        _id: '$farm',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    await this.model('Farm').findByIdAndUpdate(farmId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
ReviewSchema.pre('save', function () {
  if (!this.isModified('rating')) {
    this.constructor.getAverageRating(this.farm);
  }
});

// Call getAverageCost after save
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.farm);
});

// Call getAverageCost before remove
ReviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.farm);
});

module.exports = mongoose.model('Review', ReviewSchema);
