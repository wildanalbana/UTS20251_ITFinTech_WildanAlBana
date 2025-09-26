import connect from '../../../lib/mongodb.js';
import Checkout from '../../../models/Checkout.js';
import Payment from '../../../models/Payment.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' });

  await connect();

  const { items, buyerEmail } = req.body;

  console.log('DEBUG items:', items);
  console.log('DEBUG buyerEmail:', buyerEmail);
  console.log('DEBUG XENDIT_SECRET_KEY:', process.env.XENDIT_SECRET_KEY ? 'OK' : 'MISSING');

  if (!items || items.length === 0) {
    return res.status(400).json({ ok: false, message: 'Keranjang kosong' });
  }

  const total = items.reduce((s, it) => s + it.qty * it.price, 0);
  if (!total || total <= 0) {
    return res.status(400).json({ ok: false, message: 'Total amount invalid' });
  }

  const externalId = `order-${Date.now()}`;

  const checkout = await Checkout.create({
    externalId,
    items,
    total,
    status: 'PENDING',
  });

  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ ok: false, error: 'XENDIT_SECRET_KEY missing on server' });
  }

  const basicAuth = Buffer.from(`${secretKey}:`).toString('base64');

  const payload = {
    external_id: externalId,
    amount: total,
    payer_email: buyerEmail || 'buyer@example.com',
    description: `Payment for ${externalId}`,
    success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?external_id=${externalId}`,
    failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?external_id=${externalId}&failed=true`
  };

  try {
    const r = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const inv = await r.json();

    if (!r.ok) {
      console.error('Xendit API error response:', inv);
      await Payment.create({
        checkout: checkout._id,
        externalId,
        invoiceId: inv.id || null,
        amount: total,
        status: inv.status || 'ERROR',
        invoiceUrl: inv.invoice_url || null,
      });
      return res.status(502).json({ ok: false, error: inv });
    }

    console.log('✅ Xendit invoice created:', inv);

    await Payment.create({
      checkout: checkout._id,
      externalId,
      invoiceId: inv.id || inv.invoice_id || null,
      amount: total,
      status: inv.status || 'PENDING',
      invoiceUrl: inv.invoice_url || inv.invoiceURL || inv.url || null,
    });

    return res.status(200).json({ ok: true, invoiceUrl: inv.invoice_url || inv.invoiceURL || inv.url, externalId });
  } catch (err) {
    console.error('Unexpected error calling Xendit:', err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}
