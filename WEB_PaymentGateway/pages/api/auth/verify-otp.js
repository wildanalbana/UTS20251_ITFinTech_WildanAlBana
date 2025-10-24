// pages/api/auth/verify-otp.js
import dbConnect from '../../../lib/mongodb.js';
import User from '../../../models/Users.js';
import { signToken } from '../../../util/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();

  const { email, otp } = req.body || {};
  if (!email || !otp) return res.status(400).json({ error: 'Missing email or otp' });

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ error: 'User not found' });

  // pastikan ada OTP yang diminta sebelumnya
  if (!user.otp || !user.otpExpiresAt) return res.status(400).json({ error: 'No OTP requested' });

  const now = new Date();
  if (new Date(user.otpExpiresAt) < now) {
    // bersihkan otp yang kadaluarsa
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();
    return res.status(400).json({ error: 'OTP expired' });
  }

  if (String(user.otp).trim() !== String(otp).trim()) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  // OTP valid -> hapus OTP dan keluarkan token
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  const token = signToken(user);
  // set cookie (HttpOnly)
  res.setHeader(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`
  );

  return res.json({ ok: true });
}
