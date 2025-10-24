// lib/whatsapp.js
import fetch from 'node-fetch'; // pastikan sudah npm i node-fetch@3
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+14155238886'

function basicAuthHeader() {
  return 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
}

export async function sendWhatsapp(to, message) {
  console.log('[sendWhatsapp] env check', { accountSid: !!accountSid, from });

  if (!accountSid || !authToken || !from) {
    console.error('[sendWhatsapp] TWILIO env missing');
    return null;
  }
  if (!to) {
    console.error('[sendWhatsapp] missing `to`');
    return null;
  }

  const normalized = String(to).replace(/\s/g, '');
  const toWhats = normalized.startsWith('whatsapp:') ? normalized : `whatsapp:${normalized}`;

  console.log('[sendWhatsapp] sending', { from, to: toWhats, bodyPreview: message.slice(0,120) });

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams();
  body.append('From', from);
  body.append('To', toWhats);
  body.append('Body', message);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const j = await res.json();
    console.log('[sendWhatsapp] twilio status', res.status, 'body:', j);

    if (!res.ok) {
      // log details so kita tahu code Twilio
      console.error('[sendWhatsapp] Twilio returned error', j);
      return null;
    }
    console.log('[sendWhatsapp] success sid=', j.sid);
    return j;
  } catch (err) {
    console.error('[sendWhatsapp] network error', err);
    return null;
  }
}
