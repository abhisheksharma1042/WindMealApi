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

//Create sell By date of 4 days from received on
ProductSchema.pre('save', function (next) {
  this.sellBy = new Date().setDate(new Date().getDate() + 4);
  // console.log('Sell By added');
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
