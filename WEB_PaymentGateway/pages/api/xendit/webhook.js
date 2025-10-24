// pages/api/xendit/webhook.js
import dbConnect from '../../../lib/mongodb.js';
import Checkout from '../../../models/Checkout.js';
import Payment from '../../../models/Payment.js';
import User from '../../../models/Users.js';
import { spawn } from 'child_process'; // untuk jalankan curl

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // optional: simple token check
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

    // normalize possible fields
    const statusRaw = (body.status || body.state || '').toString();
    const status = statusRaw.toLowerCase();
    const externalId = body.external_id || body.externalId || body.reference || null;
    const invoiceId = body.id || body.invoice_id || body.invoiceId || body.reference_id || null;

    console.log('Parsed webhook: status=', status, 'externalId=', externalId, 'invoiceId=', invoiceId);

    const paidStates = new Set(['paid', 'settled', 'completed', 'capture', 'success']);
    if (!paidStates.has(status)) {
      console.log('Webhook: not a paid event -> ignore.');
      return res.json({ ok: true, note: 'ignored non-paid event', status });
    }

    // cari payment dan checkout
    let payment = await Payment.findOne({
      $or: [
        { externalId },
        { invoiceId },
        { invoiceUrl: { $regex: invoiceId, $options: 'i' } }
      ]
    });
    let checkout = null;
    if (payment && payment.checkout) checkout = await Checkout.findById(payment.checkout);
    if (!checkout && externalId) checkout = await Checkout.findOne({ externalId });

    if (!payment && !checkout) {
      console.warn('Webhook: no matching payment/checkout found');
      return res.status(200).json({ ok: false, message: 'no matching payment/checkout' });
    }

    // update status ke PAID
    if (payment) {
      payment.status = 'PAID';
      payment.updatedAt = new Date();
      await payment.save();
      console.log('✅ Payment updated to PAID');
    }
    if (checkout) {
      checkout.status = 'PAID';
      checkout.updatedAt = new Date();
      await checkout.save();
      console.log('✅ Checkout updated to PAID');
    }

    // ambil nomor HP dari berbagai sumber
    let phone =
      checkout?.buyerPhone ||
      payment?.buyerPhone ||
      body.payer_phone ||
      body.customer_phone ||
      (body.payer && body.payer.phone) ||
      null;

    // fallback: ambil dari user, kalau ada user di Payment/Checkout
    let user = null;
    if (!phone && (checkout?.user || payment?.user)) {
      const userId = checkout?.user || payment?.user;
      user = await User.findById(userId);
      if (user?.phone) phone = user.phone;
    }

    // safety log
    console.log('Resolved phone:', phone, '| externalId:', externalId);

    // kalau ada nomor, jalankan curl dinamis
    if (phone && externalId) {
      try {
        const postData = JSON.stringify({ externalId, phone });

        // buat argumen curl dinamis
        const args = [
          '-v',
          '-X', 'POST',
          'http://localhost:3000/api/admin/resend-notif',
          '-H', 'Content-Type: application/json',
          '-d', postData
        ];

        console.log('🔥 Running dynamic CURL:', 'curl', args.join(' '));

        const curl = spawn('curl', args);

        // tampilkan log hasil curl
        curl.stdout.on('data', (data) => {
          console.log('📤 CURL stdout:', data.toString());
        });

        curl.stderr.on('data', (data) => {
          console.warn('⚠️ CURL stderr:', data.toString());
        });

        curl.on('close', (code) => {
          console.log(`CURL process exited with code ${code}`);
        });
      } catch (err) {
        console.error('Error running dynamic CURL:', err.message);
      }
    } else {
      console.warn('⚠️ No phone or externalId found, skip curl resend-notif');
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
