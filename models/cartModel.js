const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      sizes: {
        type: Map,
        of: Number,
        required: true
      }
    }
  ],
  totalQuantity: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Cart', cartSchema);
