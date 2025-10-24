// lib/whatsapp.js
import twilio from 'twilio';

// Ambil kredensial dari .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM; // contoh: 'whatsapp:+14155238886'

// Pastikan Twilio terinisialisasi hanya jika variabel tersedia
let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Kirim pesan WhatsApp ke user.
 * @param {string} to Nomor tujuan, contoh: +6281234567890
 * @param {string} message Isi pesan yang dikirim
 */
export async function sendWhatsapp(to, message) {
  if (!client) {
    console.log('ℹ️ Twilio not configured, WA message skipped:', message);
    return;
  }

  try {
    const result = await client.messages.create({
      body: message,
      from,
      to: `whatsapp:${to.replace(/\s/g, '')}` // pastikan format sesuai
    });
    console.log(`✅ WhatsApp sent to ${to}: ${result.sid}`);
  } catch (err) {
    console.error('❌ WhatsApp send failed:', err.message);
  }
}
