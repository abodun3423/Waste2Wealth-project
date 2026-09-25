const jwt = require('jsonwebtoken');

const companyAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        error: 'Company authentication required'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== 'company') {
      return res.status(403).json({
        error: 'Company access required'
      });
    }

    if (!decoded.companyId) {
      return res.status(401).json({
        error: 'Invalid company token'
      });
    }

    req.companyId = decoded.companyId;
    req.companyRole = decoded.role;

    next();

  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired company token'
    });
  }
};

module.exports = companyAuth;
