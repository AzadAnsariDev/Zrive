import cron from "node-cron";
import mongoose from "mongoose";
import orderModel from "../models/order.model.js"; 
import { prepareOrderRejection } from "../services/orderRejection.service.js";

const processExpiredOrders = async () => {
  const now = new Date();

  const expiredOrders = await orderModel
    .find({
      orderStatus: "placed",
      confirmationStatus: "pending",
      confirmationDeadline: { $lt: now },
    })
    .select("_id");

  if (expiredOrders.length === 0) return;

  console.log(`[orderTimeout] Found ${expiredOrders.length} expired order(s)`);

  for (const { _id } of expiredOrders) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await orderModel
        .findOne({
          _id,
          orderStatus: "placed",
          confirmationStatus: "pending",
        })
        .populate("payment")
        .session(session);

      if (!order) {
        await session.abortTransaction();
        continue;
      }

      await prepareOrderRejection({
        order,
        reason: "seller_no_response",
        weight: 1.5,
        session,
      });

      await session.commitTransaction();
      console.log(`[orderTimeout] Order ${_id} auto-rejected due to seller timeout`);
    } catch (err) {
      await session.abortTransaction();
      console.error(`[orderTimeout] Failed to process expired order ${_id}:`, err);
    } finally {
      session.endSession();
    }
  }
};

// Auto-reject orders where seller failed to confirm within the 24-hour deadline
export const startOrderTimeoutCron = () => {
  cron.schedule("*/15 * * * *", () => {
    console.log("[orderTimeout] Cron running...");
    processExpiredOrders().catch((err) =>
      console.error("[orderTimeout] Unexpected cron error:", err),
    );
  });
};