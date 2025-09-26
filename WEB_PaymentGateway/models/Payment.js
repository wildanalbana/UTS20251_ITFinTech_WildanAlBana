import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  checkout: { type: mongoose.Schema.Types.ObjectId, ref: 'Checkout' },
  externalId: String,
  invoiceId: String,
  amount: Number,
  status: String,
  invoiceUrl: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
