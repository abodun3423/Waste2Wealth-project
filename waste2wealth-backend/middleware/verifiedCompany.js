const RecyclingCompany = require('../models/RecyclingCompany');
const verifiedCompany = async (req, res, next) => {
  try {
    const company = await RecyclingCompany.findById(req.companyId).select('verified accountActive');
    if (!company) return res.status(404).json({error:'Company account not found'});
    if (!company.accountActive) return res.status(403).json({error:'Company account is inactive'});
    if (!company.verified) return res.status(403).json({error:'Company verification is required to manage pickups'});
    next();
  } catch (error) {
    console.error('Company verification error:', error);
    return res.status(500).json({error:'Unable to verify company account'});
  }
};
module.exports = verifiedCompany;
