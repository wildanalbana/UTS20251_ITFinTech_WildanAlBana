import { verifyToken } from '../util/auth.js';

export const requireAdmin = (handler) => async (req, res) => {
  try {
    // Next.js API routes expose cookies in req.cookies
    const token = req.cookies?.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    if (!token) return res.status(401).json({ error: 'unauthenticated' });

    const decoded = verifyToken(token);
    if (!decoded?.isAdmin) return res.status(403).json({ error: 'forbidden' });

    // attach user id if needed
    req.userId = decoded.id;
    return handler(req, res);
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
};
