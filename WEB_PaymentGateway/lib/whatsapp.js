// lib/whatsapp.js
// Twilio WhatsApp send via HTTP (no twilio SDK).
// Uses global fetch if available, otherwise dynamically imports node-fetch.

import 'dotenv/config';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM; // contoh: 'whatsapp:+14155238886'

function basicAuthHeader() {
  return 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
}

/**
 * Get a fetch function: prefer global fetch, otherwise dynamic import node-fetch
 * (so project masih berjalan di Node versi lama jika node-fetch di-install).
 */
async function getFetch() {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch.bind(globalThis);
  }
  // dynamic import untuk menghindari error saat package tidak terpasang
  try {
    const mod = await import('node-fetch');
    // node-fetch v3 default export adalah fungsi
    return mod.default;
  } catch (e) {
    throw new Error('No fetch available: install node-fetch (`npm i node-fetch@3`) or upgrade Node');
  }
}

/**
 * Kirim pesan WhatsApp via Twilio REST API tanpa SDK
 * @param {string} to - nomor tujuan, contoh: +6281234567890 atau whatsapp:+628...
 * @param {string} message - isi pesan
 * @returns {object|null} response JSON Twilio jika sukses, otherwise null
 */
export async function sendWhatsapp(to, message) {
  if (!accountSid || !authToken || !from) {
    console.error('❌ TWILIO env belum lengkap. Pastikan TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM terisi.');
    return null;
  }
  if (!to) {
    console.error('❌ Nomor tujuan (to) kosong. Tidak mengirim pesan.');
    return null;
  }
  if (!message) {
    console.error('❌ Pesan kosong. Tidak mengirim pesan.');
    return null;
  }

  // normalisasi nomor
  let normalized = String(to).trim();
  // jika user mengirim 'whatsapp:+62...' biarkan, jika +62... tambahkan prefix
  const toWhats = normalized.startsWith('whatsapp:')
    ? normalized
    : `whatsapp:${normalized.replace(/\s+/g, '')}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params = new URLSearchParams();
  params.append('From', from);
  params.append('To', toWhats);
  params.append('Body', message);

  try {
    const fetch = await getFetch();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    // Twilio selalu merespon JSON (termasuk error)
    const j = await res.json();

    if (!res.ok) {
      // contoh: invalid from/to pair (21910), atau nomor belum terdaftar di Twilio sandbox
      console.error('❌ Twilio API returned error:', j.message || j);
      if (j.code) console.error('Twilio error code:', j.code);
      if (j.more_info) console.error('More info:', j.more_info);
      return null;
    }

    console.log(`✅ WhatsApp terkirim ke ${toWhats} | SID: ${j.sid}`);
    return j;
  } catch (err) {
    console.error('❌ Gagal mengirim WA (network/runtime):', err.message || err);
    return null;
  }
}
