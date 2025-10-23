import jwt from 'jsonwebtoken';

export function signToken(user) {
  const payload = { id: user._id?.toString?.(), isAdmin: !!user.isAdmin };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
}
