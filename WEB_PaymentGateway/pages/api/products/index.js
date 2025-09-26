import connect from '../../../lib/mongodb.js';
import Product from '../../../models/Product.js';

export default async function handler(req, res) {
  await connect();
  if (req.method === 'GET') {
    const products = await Product.find().lean();
    return res.json({ ok: true, products });
  }
  res.status(405).json({ ok: false, message: 'Method not allowed' });
}
