// pages/api/auth/login.js
import dbConnect from '../../../lib/mongodb.js';
import User from '../../../models/Users.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../util/auth.js';
import { sendWhatsapp } from '../../../lib/whatsapp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();

  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Email dan password wajib diisi' });

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(401).json({ error: 'Email atau password salah' });

  const valid = await bcrypt.compare(password, user.passwordHash || '');
  if (!valid) return res.status(401).json({ error: 'Email atau password salah' });

  // --- Jika user menggunakan MFA (multi-factor) ---
  if (user.mfaEnabled) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // berlaku 5 menit
    await user.save();

    try {
      if (user.phone) {
        await sendWhatsapp(
          user.phone,
          `Halo ${user.name || 'user'}! Kode OTP login kamu adalah *${otp}* (berlaku 5 menit).`
        );
      }
    } catch (err) {
      console.error('Gagal kirim WA OTP:', err.message);
    }

    return res.status(200).json({
      mfaRequired: true,
      phone: user.phone
        ? user.phone.replace(/.(?=.{4})/g, '*')
        : undefined
    });
  }

  // --- Jika tidak menggunakan MFA ---
  const token = signToken(user);
  res.setHeader(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`
  );

  return res.json({ ok: true });
}
