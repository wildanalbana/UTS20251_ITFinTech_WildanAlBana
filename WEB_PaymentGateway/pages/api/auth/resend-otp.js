// pages/api/auth/resend-otp.js
import dbConnect from '../../../lib/mongodb.js';
import User from '../../../models/Users.js';
import { sendWhatsapp } from '../../../lib/whatsapp.js';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 menit
const MIN_RESEND_INTERVAL_MS = 20 * 1000; // minimal jeda antar resend = 20 detik
const MAX_RESEND_PER_HOUR = 5; // batasi percobaan resend per jam (opsional)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Pastikan user punya nomor WA
  if (!user.phone) return res.status(400).json({ error: 'User has no phone number' });

  // Rate limiting sederhana berbasis field di dokumen user
  // Kita menyimpan lastOtpSentAt dan otpResendCountHourly (opsional)
  const now = new Date();
  if (!user.lastOtpSentAt) user.lastOtpSentAt = null;
  if (!user.otpResendCountHourly) user.otpResendCountHourly = 0;
  if (!user.otpResendHourWindowStart) user.otpResendHourWindowStart = now;

  // reset counter per jam
  if (user.otpResendHourWindowStart && (now - new Date(user.otpResendHourWindowStart)) > 60*60*1000) {
    user.otpResendCountHourly = 0;
    user.otpResendHourWindowStart = now;
  }

  // block if too many resend in hour
  if (user.otpResendCountHourly >= MAX_RESEND_PER_HOUR) {
    await user.save().catch(()=>{});
    return res.status(429).json({ error: 'Too many OTP resend attempts. Please try again later.' });
  }

  // minimal interval between resend
  if (user.lastOtpSentAt && (now - new Date(user.lastOtpSentAt)) < MIN_RESEND_INTERVAL_MS) {
    const wait = Math.ceil((MIN_RESEND_INTERVAL_MS - (now - new Date(user.lastOtpSentAt))) / 1000);
    return res.status(429).json({ error: `Please wait ${wait} seconds before requesting another OTP.` });
  }

  // generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  user.lastOtpSentAt = now;
  user.otpResendCountHourly = (user.otpResendCountHourly || 0) + 1;
  if (!user.otpResendHourWindowStart) user.otpResendHourWindowStart = now;

  try {
    await user.save();
  } catch (err) {
    console.error('Failed to save OTP fields:', err);
    return res.status(500).json({ error: 'Failed to save OTP' });
  }

  // kirim via WhatsApp (fallback: log saja kalau Twilio belum dikonfigurasi)
  try {
    const message = `Halo ${user.name || ''}! Kode OTP login kamu adalah *${otp}* (berlaku 5 menit).`;
    await sendWhatsapp(user.phone, message);
  } catch (err) {
    console.error('sendWhatsapp error', err);
    // jangan hapus OTP di DB, tapi laporkan kegagalan kirim
    return res.status(500).json({ error: 'Failed to send OTP via WhatsApp' });
  }

  // kembalikan masked phone buat UI (opsional)
  const masked = user.phone ? user.phone.replace(/.(?=.{4})/g, '*') : null;
  return res.json({ ok: true, phone: masked });
}
