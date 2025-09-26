import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  stock: Number,
  description: String
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
