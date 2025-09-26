// pages/api/payment/status.js
import connect from '../../../lib/mongodb.js';
import Payment from '../../../models/Payment.js';

export default async function handler(req, res) {
  await connect();
  const { external_id } = req.query;
  if (!external_id) return res.status(400).json({ ok: false });

  const p = await Payment.findOne({ externalId: external_id }).lean();
  if (!p) return res.status(404).json({ ok: false });

  return res.json({ ok: true, status: p.status });
}
