import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true }, // ubah dari "name" → "title"
  category: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  description: { type: String },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
