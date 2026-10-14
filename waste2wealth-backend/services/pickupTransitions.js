const mongoose = require('mongoose');
const Pickup = require('../models/PickupRequest');
const Company = require('../models/RecyclingCompany');
const User = require('../models/User');

const next = { pending: ['accepted', 'cancelled'], accepted: ['collected', 'cancelled'], collected: ['completed', 'cancelled'], completed: [], cancelled: [] };
class PickupError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
function pointsForWeight(weight) {
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0 || Math.round(weight * 10) <= 0) throw new PickupError('Positive verified weight is required');
  return Math.round(weight * 10);
}
async function transitionPickup({ id, companyId, status, verifiedWeight, admin = false }) {
  if (!mongoose.isValidObjectId(id)) throw new PickupError('Invalid pickup ID');
  if (!Object.prototype.hasOwnProperty.call(next, status) && status !== 'completed') throw new PickupError('Invalid status');
  if (!['accepted','collected','completed','cancelled'].includes(status)) throw new PickupError('Invalid status');
  const points = status === 'completed' ? pointsForWeight(verifiedWeight) : 0;
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const filter = { _id: id, ...(admin ? {} : { company: companyId }) };
      const pickup = await Pickup.findOne(filter).session(session);
      if (!pickup) throw new PickupError('Pickup not found or not assigned to this company', 404);
      if (!(next[pickup.status] || []).includes(status)) throw new PickupError('Invalid pickup status transition', 409);
      const company = await Company.findById(pickup.company).session(session);
      if (!company || company.verified !== true || company.accountActive !== true) throw new PickupError('Verified active recycling company required', 403);
      if (status === 'completed') {
        if (pickup.pointsProcessed) throw new PickupError('Points already awarded', 409);
        const claimed = await Pickup.findOneAndUpdate(
          { ...filter, status: 'collected', pointsProcessed: false },
          { $set: { status: 'completed', verifiedWeight, pointsAwarded: points, pointsProcessed: true } },
          { new: true, session, runValidators: true }
        );
        if (!claimed) throw new PickupError('Pickup was already updated', 409);
        const user = await User.findByIdAndUpdate(pickup.user, { $inc: { points } }, { new: true, session });
        if (!user) throw new PickupError('User not found', 404);
        return { pickup: claimed, pointsEarned: points, totalPoints: user.points };
      }
      const changed = await Pickup.findOneAndUpdate(
        { ...filter, status: pickup.status, pointsProcessed: false },
        { $set: { status } }, { new: true, session, runValidators: true }
      );
      if (!changed) throw new PickupError('Pickup was already updated', 409);
      return { pickup: changed, pointsEarned: 0 };
    });
  } finally { await session.endSession(); }
}
module.exports = { transitionPickup, pointsForWeight, PickupError };
