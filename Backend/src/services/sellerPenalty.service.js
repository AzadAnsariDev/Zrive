import userModel from "../models/user.model.js";
import sellerModel from "../models/seller.model.js";

const BAN_DURATION_DAYS = 7;
const STRIKE_THRESHOLD = 3;

// Business phones of the two protected seed sellers — never auto-ban these accounts
const PROTECTED_BUSINESS_PHONES = ["7208132532", "9137188101"];

/**
 * weight: reject = 1, no-response = 1.5
 */
export const applyStrike = async ({ sellerId, weight, session }) => {
  const sellerProfile = await sellerModel.findById(sellerId).session(session);
  if (!sellerProfile) return;

  const seller = await userModel.findById(sellerProfile.userId).session(session);
  if (!seller) return;

  seller.strikeCount = (seller.strikeCount || 0) + weight;

  if (seller.strikeCount >= STRIKE_THRESHOLD && !seller.isBanned) {
    // Check if this seller is one of the protected seed sellers
    const isProtected =
      sellerProfile && PROTECTED_BUSINESS_PHONES.includes(sellerProfile.businessPhone);

    if (!isProtected) {
      seller.isBanned = true;
      seller.banExpiresAt = new Date(Date.now() + BAN_DURATION_DAYS * 24 * 60 * 60 * 1000);
    }
  }

  await seller.save({ session });
  return seller;
};