const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a product title.'],
  },
  description: {
    type: String,
    required: [true, 'Please add description.'],
  },
  receivedOn: {
    type: Date,
    default: Date.now,
  },
  sellBy: {
    type: Date,
    // 4 Days
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity.'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price.'],
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
  photo: {
    type: String,
    default: 'no-photo.jpg',
  },
  status: {
    type: String,
    default: 'Available',
  },
});

// // Static method to get average rating
// ProductSchema.statics.getAverageCost = async function (farmId) {
//   console.log('Calculating average review rating....'.bgBlue);
//   const obj = await this.aggregate([
//     {
//       $match: { farm: farmId },
//     },
//     {
//       $group: {
//         _id: '$farm',
//         averageRating: { $avg: '$tuition' },
//       },
//     },
//   ]);
// try {
//   await this.model('Farm').findByIdAndUpdate(farmId, {
//     averageCost: Math.ceil(oj[0].averageCost / 10) * 10,
//   });
// } catch (error) {
//   console.log(error);
// }
// };
// Set status
ProductSchema.pre('save', function (next) {
  this.sellBy = new Date().setDate(new Date().getDate() + 4);
  if (this.quantity <= 0) {
    this.status = 'Sold Out';
  } else if (this.quantity > 5 && this.quantity < 10) {
    this.status = 'Limited Avalaible';
  } else {
    this.status = 'Avalaible';
  }
  next();
});

// // Call detAverageCost after save
// ProductSchema.post('save', function () {
//   this.constructor.getAverageCost(this.farm);
// });

// // Call detAverageCost before remove
// ProductSchema.pre('save', function () {
//   this.constructor.getAverageCost(this.farm);
// });

module.exports = mongoose.model('Product', ProductSchema);
