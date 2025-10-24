import dbConnect from '../../../lib/mongodb.js';
import User from '../../../models/Users.js';
import { signToken } from '../../../util/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();

  const { email, otp } = req.body || {};
  if (!email || !otp)
    return res.status(400).json({ error: 'Email dan OTP wajib diisi' });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.otp || !user.otpExpiresAt)
    return res.status(400).json({ error: 'OTP tidak ditemukan atau sudah kadaluarsa' });

  if (Date.now() > user.otpExpiresAt.getTime())
    return res.status(400).json({ error: 'OTP sudah kadaluarsa' });

  if (user.otp !== otp)
    return res.status(400).json({ error: 'OTP salah' });

  // Reset OTP
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  const token = signToken(user);
  res.setHeader(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`
  );

  return res.json({ ok: true, message: 'Login berhasil' });
}
