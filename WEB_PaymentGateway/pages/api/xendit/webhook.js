// pages/api/xendit/webhook.js
import dbConnect from '../../../lib/mongodb.js';
import Checkout from '../../../models/Checkout.js';
import Payment from '../../../models/Payment.js';
import User from '../../../models/Users.js';
import { sendWhatsapp } from '../../../lib/whatsapp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // optional: callback token check (keep for production)
  const callbackTokenHeader = req.headers['x-callback-token'] || req.headers['x-callback-token'.toLowerCase()];
  if (process.env.XENDIT_CALLBACK_TOKEN) {
    if (!callbackTokenHeader || callbackTokenHeader !== process.env.XENDIT_CALLBACK_TOKEN) {
      console.warn('Webhook: invalid callback token', callbackTokenHeader);
      return res.status(401).json({ error: 'invalid token' });
    }
  }

  await dbConnect();

  try {
    const body = req.body || {};
    console.log('Webhook body:', JSON.stringify(body));

    // normalize fields Xendit / provider
    const statusRaw = (body.status || body.state || '').toString();
    const status = statusRaw.toLowerCase();
    const externalId = body.external_id || body.externalId || body.reference || null;
    const invoiceId = body.id || body.invoice_id || body.invoiceId || body.reference_id || null;

    console.log('Parsed webhook: status=', status, 'externalId=', externalId, 'invoiceId=', invoiceId);

    // only handle paid-like events
    const paidStates = new Set(['paid', 'settled', 'completed', 'capture', 'success']);
    if (!paidStates.has(status)) {
      console.log('Webhook: ignoring non-paid event, status=', status);
      return res.json({ ok: true, note: 'ignored non-paid event', status });
    }

    // find payment / checkout (try multiple ways)
    let payment = null;
    let checkout = null;

    if (invoiceId) {
      payment = await Payment.findOne({
        $or: [{ invoiceId }, { invoiceId: String(invoiceId) }]
      });
    }
    if (!payment && externalId) {
      payment = await Payment.findOne({
        $or: [{ externalId }, { externalId: String(externalId) }]
      });
    }

    if (payment && payment.checkout) {
      checkout = await Checkout.findById(payment.checkout);
    }
    if (!checkout && externalId) {
      checkout = await Checkout.findOne({ externalId });
    }

    // fallback: match invoiceUrl containing invoiceId
    if (!payment && invoiceId) {
      payment = await Payment.findOne({ invoiceUrl: { $regex: invoiceId, $options: 'i' } });
      if (payment && payment.checkout) checkout = await Checkout.findById(payment.checkout);
    }

    if (!payment && !checkout) {
      console.warn('Webhook: no matching payment/checkout found for', { externalId, invoiceId });
      return res.status(200).json({ ok: false, message: 'no matching payment/checkout' });
    }

    // update DB statuses
    if (payment) {
      payment.status = 'PAID';
      payment.updatedAt = new Date();
      await payment.save();
      console.log('Payment updated to PAID:', payment._id?.toString?.() || payment.invoiceId || payment.externalId);
    }
    if (checkout) {
      checkout.status = 'PAID';
      checkout.updatedAt = new Date();
      await checkout.save();
      console.log('Checkout updated to PAID:', checkout.externalId);
    }

    // Resolve phone number from many possible places
    let phone =
      checkout?.buyerPhone ||
      checkout?.phone ||
      payment?.buyerPhone ||
      payment?.phone ||
      body.payer_phone ||
      body.customer_phone ||
      (body.payer && body.payer.phone) ||
      null;

    // if still not found, try looking up user referenced in checkout/payment
    if (!phone && (checkout?.user || payment?.user)) {
      const userId = checkout?.user || payment?.user;
      try {
        const user = await User.findById(userId);
        if (user?.phone) phone = user.phone;
      } catch (e) {
        console.warn('Failed to load user for phone lookup', e?.message || e);
      }
    }

    console.log('Resolved phone for notification:', phone);

    // prepare message body
    const itemsList = (checkout && checkout.items && checkout.items.length)
      ? checkout.items.map(it => `${it.name || it.title || 'Item'} x${it.qty} (Rp ${Number(it.price).toLocaleString('id-ID')})`).join('\n')
      : '-';
    const totalFormatted = checkout ? Number(checkout.total || payment?.amount || 0).toLocaleString('id-ID') : '0';
    const invoiceRef = checkout?.externalId || payment?.externalId || invoiceId || 'N/A';

    const message = [
      `Terima kasih — Pembayaran kamu sudah *lunas*! 🎉`,
      ``,
      `🧾 Invoice: ${invoiceRef}`,
      `💰 Total: Rp ${totalFormatted}`,
      `📦 Items:\n${itemsList}`,
      ``,
      `Pesanan akan segera diproses.`
    ].join('\n');

    // send WA directly (no curl spawn)
    if (phone) {
      try {
        const sendResult = await sendWhatsapp(phone, message);
        console.log('sendWhatsapp result:', sendResult ? { sid: sendResult.sid } : 'null');

        if (!sendResult) {
          console.warn('WA send returned null for', phone);
        } else {
          console.log('WA payment notification sent to', phone);
        }
      } catch (err) {
        console.error('Error while sending WA notification:', err?.message || err);
      }
    } else {
      console.warn('No phone available to notify for payment', invoiceRef);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
