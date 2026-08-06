import cron from "node-cron";
import { processRefund } from "../services/orderRejection.service.js";

export const startRefundRetryCron = () => {
  cron.schedule("0 */6 * * *", async () => {
    console.log("[refund-retry-cron] running...");

    // "permanently_failed" is intentionally excluded — those need a
    // human, not another automatic attempt.
    const failedOrders = await orderModel.find({ "refund.status": "failed" });

    console.log(`[refund-retry-cron] found ${failedOrders.length} retryable failed refund(s)`);

    for (const order of failedOrders) {
      try {
        await processRefund(order._id);
        console.log(`[refund-retry-cron] order ${order._id} → refund succeeded`);
      } catch (err) {
        console.error(`[refund-retry-cron] order ${order._id} → still failed:`, err.message);
      }
    }
  });
};