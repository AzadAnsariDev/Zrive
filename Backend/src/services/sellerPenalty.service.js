import userModel from "../models/user.model.js";

const BAN_DURATION_DAYS = 7;
const STRIKE_THRESHOLD = 3;

/**
 * weight: reject = 1, no-response = 1.5
 */
export const applyStrike = async ({ sellerId, weight, session }) => {
  const seller = await userModel.findById(sellerId).session(session);
  if (!seller) return;

  seller.strikeCount = (seller.strikeCount || 0) + weight;

  if (seller.strikeCount >= STRIKE_THRESHOLD && !seller.isBanned) {
    seller.isBanned = true;
    seller.banExpiresAt = new Date(Date.now() + BAN_DURATION_DAYS * 24 * 60 * 60 * 1000);
  }

  await seller.save({ session });
  return seller;
};