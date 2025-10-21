import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';
import { requireAdmin } from '../../../lib/middleware';
import mongoose from 'mongoose';

async function handler(req,res){
  await dbConnect();
  const { range='daily' } = req.query; // daily or monthly
  if (range === 'daily') {
    const pipeline = [
      { $match: { status: 'paid' } },
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
    const data = await Order.aggregate(pipeline);
    // format date label
    const formatted = data.map(d => {
      const { year, month, day } = d._id;
      return { label: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`, total: d.total, count: d.count };
    });
    return res.json(formatted);
  } else {
    const pipeline = [
      { $match: { status: 'paid' } },
      { $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ];
    const data = await Order.aggregate(pipeline);
    const formatted = data.map(d => {
      const { year, month } = d._id;
      return { label: `${year}-${String(month).padStart(2,'0')}`, total: d.total, count: d.count };
    });
    return res.json(formatted);
  }
}

export default requireAdmin(handler);
