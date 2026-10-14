'use strict';
const POINTS_PER_KG = 10;
function verifiedPoints(weight) {
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) {
    throw new RangeError('Verified weight must be a positive finite number');
  }
  return Math.round(weight * POINTS_PER_KG);
}
module.exports = { POINTS_PER_KG, verifiedPoints };
