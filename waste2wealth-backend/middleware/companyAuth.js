const jwt = require('jsonwebtoken');
const RecyclingCompany = require('../models/RecyclingCompany');

const companyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({error:'Company authentication required'});
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role !== 'company') return res.status(403).json({error:'Company access required'});
    if (!decoded.companyId) return res.status(401).json({error:'Invalid company token'});
    const company = await RecyclingCompany.findById(decoded.companyId).select('accountActive');
    if (!company) return res.status(401).json({error:'Company account no longer exists'});
    if (!company.accountActive) return res.status(403).json({error:'Company account has been deactivated'});
    req.companyId = decoded.companyId;
    req.companyRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return res.status(401).json({error:'Invalid or expired company token'});
    console.error('Company authentication error:', error);
    return res.status(500).json({error:'Company authentication failed'});
  }
};
module.exports = companyAuth;
