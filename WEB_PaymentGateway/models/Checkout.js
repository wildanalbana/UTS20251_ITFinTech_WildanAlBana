import mongoose from 'mongoose';

const CheckoutSchema = new mongoose.Schema({
  externalId: { type: String, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    qty: Number,
    price: Number
  }],
  total: Number,
  status: { type: String, enum: ['PENDING','PAID','EXPIRED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Checkout || mongoose.model('Checkout', CheckoutSchema);
