import cron from "node-cron";
import userModel from "../models/user.model.js";

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

// Check and lift expired seller bans every 30 minutes
export const startSellerUnbanCron = () => {
  cron.schedule("*/30 * * * *", () => {
    console.log("[sellerUnban] Cron running...");
    processExpiredBans().catch((err) =>
      console.error("[sellerUnban] Unexpected cron error:", err),
    );
  });
};