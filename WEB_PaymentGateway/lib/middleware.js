import { verifyToken } from './auth';
import User from '../models/User';
import dbConnect from './mongodb';

export const requireAdmin = (handler) => async (req,res) => {
  await dbConnect();
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({error:'unauth'});
  try {
    const decoded = verifyToken(token);
    if (!decoded.isAdmin) return res.status(403).json({error:'forbidden'});
    req.userId = decoded.id;
    return handler(req,res);
  } catch (e) {
    return res.status(401).json({ error:'invalid token' });
  }
}
