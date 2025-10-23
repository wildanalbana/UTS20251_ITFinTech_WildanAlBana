// pages/api/admin/login.js
import dbConnect from '../../../lib/mongodb.js';
import User from '../../../models/Users.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../util/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();
  const { email, password } = req.body || {};

  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  // require admin
  if (!user.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  // sign JWT and set cookie
  const token = signToken(user);
  // Set cookie: HttpOnly, SameSite=Lax (adjust Secure when serving HTTPS)
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7*24*3600}; SameSite=Lax`);

  return res.json({ ok: true });
}
