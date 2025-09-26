// pages/api/xendit/webhook.js
import connect from '../../../lib/mongodb.js';
import Checkout from '../../../models/Checkout.js';
import Payment from '../../../models/Payment.js';

export default async function handler(req, res) {
  await connect();

  const token = req.headers['x-callback-token'];
  if (!token || token !== process.env.XENDIT_CALLBACK_TOKEN) {
    return res.status(401).json({ ok: false, message: 'Invalid token' });
  }

  const data = req.body;
  console.log("DEBUG webhook payload:", data);

  const externalId = data?.external_id;
  const status = (data?.status || '').toUpperCase();

  if (externalId) {
    await Payment.findOneAndUpdate({ externalId }, { status });
    await Checkout.findOneAndUpdate({ externalId }, { status });
  }

  res.status(200).json({ ok: true });
}
