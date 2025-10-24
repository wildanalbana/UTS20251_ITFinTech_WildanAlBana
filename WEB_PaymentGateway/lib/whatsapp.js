// lib/whatsapp.js
import 'dotenv/config';
import fetch from 'node-fetch'; // kalau Node <18, install: npm install node-fetch@3

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM; // contoh: whatsapp:+14155238886

/**
 * Kirim pesan WhatsApp ke user via Twilio API (tanpa SDK)
 * @param {string} to Nomor tujuan (contoh: +6287776705742)
 * @param {string} message Isi pesan
 */
export async function sendWhatsapp(to, message) {
  if (!accountSid || !authToken || !from) {
    console.error('❌ TWILIO_* env belum lengkap. Cek .env kamu.');
    return;
  }

  const normalized = String(to).replace(/\s/g, '');
  const toWhatsApp = normalized.startsWith('whatsapp:')
    ? normalized
    : `whatsapp:${normalized}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params = new URLSearchParams();
  params.append('To', toWhatsApp);
  params.append('From', from);
  params.append('Body', message);

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('❌ Gagal kirim WA:', data.message || data);
      return null;
    }

    console.log(`✅ WhatsApp terkirim ke ${toWhatsApp}`);
    console.log('📦 SID:', data.sid);
    return data;
  } catch (err) {
    console.error('❌ Error kirim WA (network):', err.message);
    return null;
  }
}
