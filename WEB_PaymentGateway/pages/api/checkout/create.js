// pages/api/checkout/create.js
import connect from '../../../lib/mongodb.js';
import Checkout from '../../../models/Checkout.js';
import Payment from '../../../models/Payment.js';
import User from '../../../models/Users.js';
import { sendWhatsapp } from '../../../lib/whatsapp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ ok: false, message: 'Method not allowed' });

  await connect();

  const { items, buyerEmail, buyerPhone } = req.body;

  console.log('DEBUG items:', items);
  console.log('DEBUG buyerEmail:', buyerEmail);
  console.log('DEBUG buyerPhone:', buyerPhone);
  console.log('DEBUG XENDIT_SECRET_KEY:', process.env.XENDIT_SECRET_KEY ? 'OK' : 'MISSING');

  if (!items || items.length === 0) {
    return res.status(400).json({ ok: false, message: 'Keranjang kosong' });
  }

  const total = items.reduce((s, it) => s + it.qty * it.price, 0);
  if (!total || total <= 0) {
    return res.status(400).json({ ok: false, message: 'Total amount invalid' });
  }

  const externalId = `order-${Date.now()}`;

  // 🔹 Simpan checkout awal dengan nomor telepon
  const checkout = await Checkout.create({
    externalId,
    items,
    total,
    status: 'PENDING',
    phone: buyerPhone || null,
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
    failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?external_id=${externalId}&failed=true`,
  };

  try {
    const r = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
        invoiceUrl: inv.invoice_url || inv.invoiceURL || inv.url || null,
      });
      return res.status(502).json({ ok: false, error: inv });
    }

    console.log('✅ Xendit invoice created:', inv);

    // 🔹 Simpan payment awal
    await Payment.create({
      checkout: checkout._id,
      externalId,
      invoiceId: inv.id || inv.invoice_id || null,
      amount: total,
      status: inv.status || 'PENDING',
      invoiceUrl: inv.invoice_url || inv.invoiceURL || inv.url || null,
    });

    // 🔹 Kirim notifikasi WA setelah checkout berhasil
    (async () => {
      try {
        let user = null;
        if (buyerEmail) {
          user = await User.findOne({ email: String(buyerEmail).trim().toLowerCase() });
        }

        const phone = buyerPhone || user?.phone || checkout.phone || null;
        if (!phone) {
          console.warn('⚠️ Tidak ada nomor WA untuk pembeli, notifikasi dilewati.');
          return;
        }

        const itemsList = items
          .map(
            (it) =>
              `- ${it.name || it.title || 'Produk'} x${it.qty} (Rp ${Number(it.price).toLocaleString('id-ID')})`
          )
          .join('\n');

        const totalFormatted = Number(total).toLocaleString('id-ID');
        const invoiceUrl = inv.invoice_url || inv.invoiceURL || inv.url || '(link tidak tersedia)';

        const message = [
          `Halo ${user?.name || 'Pelanggan'} 👋`,
          '',
          `Pesanan kamu telah berhasil dibuat ✅`,
          '',
          `🧾 Invoice ID: ${externalId}`,
          `💰 Total: Rp ${totalFormatted}`,
          '',
          `📦 Daftar Pesanan:`,
          `${itemsList}`,
          '',
          `Silakan lanjutkan pembayaran di link berikut:`,
          `${invoiceUrl}`,
          '',
          `Terima kasih telah berbelanja di *Natural Nosh Petfood*! 🐾`
        ].join('\n');

        const result = await sendWhatsapp(phone, message);
        if (result) console.log(`✅ WA checkout notification sent to ${phone}`);
        else console.warn(`❌ WA checkout notification failed for ${phone}`);
      } catch (err) {
        console.error('❌ Error sending WA checkout notification:', err);
      }
    })();

    // 🔹 Balikan respons ke frontend
    return res.status(200).json({
      ok: true,
      invoiceUrl: inv.invoice_url || inv.invoiceURL || inv.url,
      externalId,
    });
  } catch (err) {
    console.error('❌ Unexpected error calling Xendit:', err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}