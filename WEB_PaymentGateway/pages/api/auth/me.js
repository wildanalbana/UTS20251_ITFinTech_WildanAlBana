// pages/api/auth/me.js
import { verifyToken } from '../../../util/auth.js'; // <-- path diperbaiki

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const cookie = req.headers.cookie || '';
  const m = cookie.match(/(?:^|; )token=([^;]+)/);
  if (!m) return res.status(401).json({ ok: false });

  const token = m[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ ok: false });

  return res.json({ ok: true, user: { id: payload.id, email: payload.email, isAdmin: payload.isAdmin } });
}
