// pages/api/admin/resend-notif.js
import dbConnect from '../../../lib/mongodb.js';
import Checkout from '../../../models/Checkout.js';
import Payment from '../../../models/Payment.js';
import User from '../../../models/Users.js';
import { sendWhatsapp } from '../../../lib/whatsapp.js';

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'method not allowed' });
  try {
    await dbConnect();
    const { externalId, invoiceId, phone } = req.body || {};
    let checkout = null;
    let payment = null;
    let user = null;

    if (externalId) checkout = await Checkout.findOne({ externalId });
    if (invoiceId) payment = await Payment.findOne({ invoiceId });
    if (!checkout && payment && payment.checkout) checkout = await Checkout.findById(payment.checkout);
    if (checkout && checkout.user) user = await User.findById(checkout.user);

    const target = phone || user?.phone || checkout?.phone || payment?.phone;
    if (!target) return res.status(400).json({ ok:false, error:'no phone found' });

    const itemsList = (checkout?.items || []).map(it => `${it.name || it.title} x${it.qty} (Rp ${Number(it.price).toLocaleString('id-ID')})`).join('\n');
    const total = checkout?.total || payment?.amount || 0;
    const message = `✅ *Pembayaran Berhasil!*\n\nInvoice: ${externalId||invoiceId}\nTotal: Rp ${Number(total).toLocaleString('id-ID')}\n\nRincian:\n${itemsList}`;

    const result = await sendWhatsapp(target, message);
    if (!result) return res.status(500).json({ ok:false, error:'send failed' });
    return res.json({ ok:true, sid: result.sid });
  } catch (e) {
    console.error('Resend-notif error:', e);
    return res.status(500).json({ ok:false, error:e.message });
  }
}
