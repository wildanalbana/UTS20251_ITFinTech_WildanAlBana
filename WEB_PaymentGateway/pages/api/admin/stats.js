// pages/api/admin/stats.js
import dbConnect from '../../../lib/mongodb';
import Checkout from '../../../models/Checkout';
import { requireAdmin } from '../../../lib/middleware';

async function handler(req, res) {
  await dbConnect();
  const { range = 'daily' } = req.query; // daily or monthly

  // We only count paid checkouts for omzet
  if (range === 'daily') {
    const pipeline = [
      { $match: { status: 'PAID' } }, // Checkout uses 'PAID' for successful payments
      { $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          total: { $sum: "$total" },
          count: { $sum: 1 }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ];
    const data = await Checkout.aggregate(pipeline);
    const formatted = data.map(d => {
      const { year, month, day } = d._id;
      return { label: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`, total: d.total, count: d.count };
    });
    return res.json(formatted);
  } else {
    const pipeline = [
      { $match: { status: 'PAID' } },
      { $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ];
    const data = await Checkout.aggregate(pipeline);
    const formatted = data.map(d => {
      const { year, month } = d._id;
      return { label: `${year}-${String(month).padStart(2,'0')}`, total: d.total, count: d.count };
    });
    return res.json(formatted);
  }
}

export default requireAdmin(handler);
