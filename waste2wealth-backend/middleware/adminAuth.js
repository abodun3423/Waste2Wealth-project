const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = async function adminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({error:'Authentication required'});
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (decoded.role !== 'admin' || !decoded.userId) return res.status(403).json({error:'Admin access required'});
    const user = await User.findById(decoded.userId).select('role');
    if (!user || user.role !== 'admin') return res.status(403).json({error:'Admin access revoked'});
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return res.status(401).json({error:'Invalid or expired token'});
    console.error('Admin authorization failed:',error);
    return res.status(500).json({error:'Authorization temporarily unavailable'});
  }
};
