import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../lib/auth'; // path sesuai

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid' });

  // If user has mfaEnabled => generate OTP and send WA (see section MFA)
  if (user.mfaEnabled) {
    // create OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit
    await user.save();
    // call out to WA send function
    await sendWhatsapp(user.phone, `Kode login: ${otp}`);
    return res.json({ mfaRequired: true });
  }

  const token = signToken(user);
  // set cookie
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7*24*3600}`);
  res.json({ ok: true });
}
