import fetch from 'node-fetch';
globalThis.fetch = fetch;
import 'dotenv/config';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const from       = process.env.TWILIO_WHATSAPP_FROM; // contoh: 'whatsapp:+14155238886'
const TWILIO_BASE = 'https://api.twilio.com/2010-04-01';

/** Normalisasi: +628xxx -> whatsapp:+628xxx, atau biarkan jika sudah whatsapp: */
function normalizeWhatsTarget(to) {
  const normalized = String(to || '').trim();
  if (!normalized) return null;
  return normalized.startsWith('whatsapp:')
    ? normalized
    : `whatsapp:${normalized.replace(/\s+/g, '')}`;
}

/** Low-level call ke Twilio dengan fetch */
async function twilioCreateMessage({ From, To, Body }) {
  const url  = `${TWILIO_BASE}/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({ From, To, Body });

  // Node 18+ punya fetch bawaan. Jika pakai Node <18, pasang node-fetch lalu import di sini.
  const res  = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  // Ambil body sebagai text dulu supaya error detail tetap terlihat saat JSON gagal parse.
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) { /* ignore */ }

  if (!res.ok) {
    // Twilio biasa mengembalikan { code, message, more_info, status }
    const msg = json?.message || text || `HTTP ${res.status}`;
    throw new Error(`Twilio ${res.status}: ${msg}`);
  }
  return json; // berisi sid, status, to, from, dll.
}

/**
 * Kirim pesan WhatsApp via Twilio (fetch).
 * @param {string} to  - +628xxx atau whatsapp:+628xxx
 * @param {string} message - isi pesan (text)
 * @returns {object|null} JSON Twilio jika sukses, null jika gagal
 */
export async function sendWhatsapp(to, message) {
  // Validasi env & input
  if (!accountSid || !authToken || !from) {
    console.error('[WARN] TWILIO env belum lengkap. Perlu TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM.');
    return null;
  }
  if (!to) {
    console.error('[WARN] Nomor tujuan kosong.');
    return null;
  }
  if (!message) {
    console.error('[WARN] Pesan kosong.');
    return null;
  }

  const toWhats = normalizeWhatsTarget(to);
  if (!toWhats) {
    console.error('[WARN] Nomor tujuan tidak valid:', to);
    return null;
  }

  try {
    const payload = await twilioCreateMessage({ From: from, To: toWhats, Body: String(message) });
    console.log(`[OK] WhatsApp terkirim ke ${toWhats} | SID: ${payload.sid}`);
    return payload;
  } catch (err) {
    console.error('[WARN] Gagal mengirim WA:', err?.message || err);
    return null;
  }
}