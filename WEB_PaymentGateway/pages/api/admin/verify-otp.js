import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { signToken } from '../../../lib/auth';

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone });
  if (!user) return res.status(401).json({ error: 'Invalid' });
  if (!user.otp || user.otpExpiresAt < new Date()) return res.status(401).json({ error: 'OTP expired' });
  if (user.otp !== otp) return res.status(401).json({ error: 'Wrong OTP' });
  user.otp = null; user.otpExpiresAt = null;
  await user.save();
  const token = signToken(user);
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7*24*3600}`);
  res.json({ ok: true });
}
