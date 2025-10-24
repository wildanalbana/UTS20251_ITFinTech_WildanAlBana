// pages/api/auth/register.js
import dbConnect from '../../../lib/mongodb.js';
import User from '../../../models/Users.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();

  const { name, email, password, phone, mfaEnabled } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  // normalisasi email
  const normalizedEmail = String(email).trim().toLowerCase();

  // cek user sudah ada
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  // hash password
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // buat user baru
  const user = new User({
    name: name || '',
    email: normalizedEmail,
    passwordHash,
    phone: phone || null,
    isAdmin: false,
    mfaEnabled: !!mfaEnabled
  });

  await user.save();

  // tidak mengembalikan passwordHash
  return res.status(201).json({ ok: true, userId: user._id, email: user.email });
}
