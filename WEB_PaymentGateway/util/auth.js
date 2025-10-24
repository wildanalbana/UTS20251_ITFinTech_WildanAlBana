// util/auth.js
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret123';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Buat JWT token dari data user
 */
export function signToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    isAdmin: user.isAdmin || false
  };
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * Verifikasi JWT token dan kembalikan payload-nya
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}
