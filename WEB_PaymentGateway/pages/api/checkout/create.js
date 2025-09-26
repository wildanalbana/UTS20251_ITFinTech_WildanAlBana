import connect from '../../../lib/mongodb.js';
import Checkout from '../../../models/Checkout.js';
import Payment from '../../../models/Payment.js';
import { Xendit } from 'xendit-node';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  await connect();

  const { items, buyerEmail } = req.body;

  console.log("DEBUG items:", items);
  console.log("DEBUG buyerEmail:", buyerEmail);
  console.log("DEBUG XENDIT_SECRET_KEY:", process.env.XENDIT_SECRET_KEY ? "OK" : "MISSING");

  if (!items || items.length === 0) {
    return res.status(400).json({ ok: false, message: 'Keranjang kosong' });
  }

  const total = items.reduce((s, it) => s + i.qty * i.price, 0);
  const externalId = `order-${Date.now()}`;

  const checkout = await Checkout.create({
    externalId,
    items,
    total,
    status: 'PENDING',
  });

  const x = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });
  const { Invoice } = x;
  const invoiceClient = new Invoice();

  try {
    const inv = await invoiceClient.createInvoice({
      externalID: externalId,
      amount: total,
      payerEmail: buyerEmail || 'buyer@example.com',
      description: `Payment for ${externalId}`,
      successRedirectURL: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?external_id=${externalId}`,
      failureRedirectURL: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?external_id=${externalId}&failed=true`,
    });

    console.log("DEBUG invoice:", inv);

    await Payment.create({
      checkout: checkout._id,
      externalId,
      invoiceId: inv.id,
      amount: total,
      status: inv.status,
      invoiceUrl: inv.invoice_url,
    });

    return res.json({ ok: true, invoiceUrl: inv.invoice_url, externalId });
  } catch (err) {
    console.error("Xendit Error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
