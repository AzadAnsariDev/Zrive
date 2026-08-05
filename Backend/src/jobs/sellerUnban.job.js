import cron from "node-cron";
import userModel from "../models/user.model.js"; // apna actual path daal do

const processExpiredBans = async () => {
  const now = new Date();

  const result = await userModel.updateMany(
    {
      isBanned: true,
      banExpiresAt: { $lt: now },
    },
    {
      $set: {
        isBanned: false,
        strikeCount: 0,
        banExpiresAt: null,
      },
    },
  );

  if (result.modifiedCount > 0) {
    console.log(`[sellerUnban] ${result.modifiedCount} seller(s) unbanned`);
  }
};

// Har 30 minute me chalega
export const startSellerUnbanCron = () => {
  cron.schedule("*/30 * * * *", () => {
    console.log("[sellerUnban] Cron running...");
    processExpiredBans().catch((err) =>
      console.error("[sellerUnban] Unexpected cron error:", err),
    );
  });
};