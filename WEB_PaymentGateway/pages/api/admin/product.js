// supports GET (list), POST (create), PUT (update), DELETE
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import { requireAdmin } from '../../../lib/middleware';

async function handler(req,res){
  await dbConnect();
  const { method } = req;
  if (method === 'GET') {
    const products = await Product.find({});
    return res.json(products);
  }
  if (method === 'POST') {
    const p = await Product.create(req.body);
    return res.status(201).json(p);
  }
  if (method === 'PUT') {
    const { id, ...data } = req.body;
    const p = await Product.findByIdAndUpdate(id, data, { new: true });
    return res.json(p);
  }
  if (method === 'DELETE') {
    const { id } = req.query;
    await Product.findByIdAndDelete(id);
    return res.json({ ok: true });
  }
  res.status(405).end();
}

export default requireAdmin(handler);
