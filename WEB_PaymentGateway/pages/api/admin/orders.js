// pages/api/admin/orders.js
import dbConnect from '../../../lib/mongodb.js';
import Checkout from '../../../models/Checkout.js';
import { requireAdmin } from '../../../lib/middleware.js';

// helper map
const statusInToUi = (s) => {
  if (!s) return 'waiting_payment';
  s = s.toUpperCase();
  if (s === 'PENDING') return 'waiting_payment';
  if (s === 'PAID') return 'paid';
  if (s === 'EXPIRED') return 'cancelled';
  return s.toLowerCase();
};

const statusUiToDb = (ui) => {
  if (!ui) return 'PENDING';
  ui = ui.toLowerCase();
  if (ui === 'waiting_payment') return 'PENDING';
  if (ui === 'paid') return 'PAID';
  if (ui === 'cancelled') return 'EXPIRED';
  return ui.toUpperCase();
};

async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  if (method === 'GET') {
    // optional filter by status (UI values allowed)
    const q = {};
    if (req.query.status) {
      // convert UI status (e.g. paid) to DB status (PAID)
      q.status = statusUiToDb(req.query.status);
    }
    const orders = await Checkout.find(q)
      .populate('items.product') // populates product if you want
      .sort({ createdAt: -1 });

    // map status for client side
    const mapped = orders.map(o => ({
      _id: o._id,
      externalId: o.externalId,
      items: o.items,
      total: o.total,
      status: statusInToUi(o.status),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt || null
    }));

    return res.json(mapped);
  }

  if (method === 'PUT') {
    // update status from admin UI
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });

    const dbStatus = statusUiToDb(status);
    const o = await Checkout.findByIdAndUpdate(id, { status: dbStatus, updatedAt: new Date() }, { new: true });

    if (!o) return res.status(404).json({ error: 'Order not found' });

    // respond mapped
    return res.json({
      _id: o._id,
      externalId: o.externalId,
      items: o.items,
      total: o.total,
      status: statusInToUi(o.status),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt
    });
  }

  res.status(405).end();
}

export default requireAdmin(handler);
