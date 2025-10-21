import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';
import { requireAdmin } from '../../../lib/middleware';

async function handler(req,res){
  await dbConnect();
  const { method } = req;
  if (method === 'GET') {
    // optional query ?status=paid
    const q = {};
    if (req.query.status) q.status = req.query.status;
    const orders = await Order.find(q).populate('user').populate('items.product').sort({createdAt:-1});
    return res.json(orders);
  }
  if (method === 'PUT') {
    // update status
    const { id, status } = req.body;
    const o = await Order.findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true });
    return res.json(o);
  }
  res.status(405).end();
}

export default requireAdmin(handler);
