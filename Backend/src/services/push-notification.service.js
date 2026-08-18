import webpush from "web-push";
import config from "../config/config.js";
import pushSubscriptionModel from "../models/pushSubscription.model.js";

// Initialize web-push with VAPID keys
if (config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    config.VAPID_SUBJECT,
    config.VAPID_PUBLIC_KEY,
    config.VAPID_PRIVATE_KEY
  );
  console.log("[Web Push] Initialized with VAPID keys");
} else {
  console.warn("[Web Push] VAPID keys missing in config");
}

/**
 * Save or update a user's web push subscription.
 *
 * When a user revokes + re-grants browser notification permission the browser
 * issues a brand-new endpoint with new VAPID keys.  The old endpoint becomes
 * permanently invalid, so we must replace it.
 *
 * Strategy:
 *  1. Remove any existing subscription for this user+userAgent whose endpoint
 *     is DIFFERENT from the one being registered (stale after permission reset).
 *  2. Upsert the current endpoint so it's always up-to-date.
 */
export const savePushSubscription = async (userId, subscriptionData, userAgent = "") => {
  try {
    if (!userId || !subscriptionData || !subscriptionData.endpoint) {
      return null;
    }

    const { endpoint, keys } = subscriptionData;
    if (!keys || !keys.p256dh || !keys.auth) {
      return null;
    }

    // Delete stale subscriptions for this user+userAgent that have a different endpoint
    if (userAgent) {
      await pushSubscriptionModel.deleteMany({
        user: userId,
        userAgent,
        endpoint: { $ne: endpoint },
      });
    }

    // Upsert by endpoint — creates if new, updates keys/user if same endpoint refreshed
    const subscription = await pushSubscriptionModel.findOneAndUpdate(
      { endpoint },
      {
        user: userId,
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        userAgent,
      },
      { upsert: true, new: true }
    );

    console.log(`[Web Push] Saved/refreshed subscription for user ${userId}`);
    return subscription;
  } catch (err) {
    console.error("[Web Push] Error saving subscription:", err.message);
    return null;
  }
};

/**
 * Remove a user's web push subscription
 */
export const removePushSubscription = async (endpoint) => {
  try {
    if (!endpoint) return;
    await pushSubscriptionModel.findOneAndDelete({ endpoint });
    console.log("[Web Push] Removed subscription:", endpoint);
  } catch (err) {
    console.error("[Web Push] Error removing subscription:", err.message);
  }
};

/**
 * Send Web Push notification to all subscriptions of a specific user
 * This works even if the browser tab is completely CLOSED.
 */
export const sendPushNotificationToUser = async (userId, payload) => {
  try {
    if (!userId) return false;

    const subscriptions = await pushSubscriptionModel.find({ user: userId });
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[Web Push] No push subscriptions found for user ${userId}`);
      return false;
    }

    const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };

        await webpush.sendNotification(pushSubscription, payloadString);
        console.log(`[Web Push] Notification sent to endpoint: ${sub.endpoint.slice(0, 30)}...`);
      } catch (err) {
        console.error(`[Web Push] Failed to deliver to ${sub.endpoint.slice(0, 30)}:`, err.statusCode || err.message);
        // If subscription is expired or invalid (410 Gone / 404 Not Found), remove it from DB
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pushSubscriptionModel.findByIdAndDelete(sub._id);
          console.log(`[Web Push] Cleaned up dead subscription ${sub._id}`);
        }
      }
    });

    await Promise.allSettled(sendPromises);
    return true;
  } catch (err) {
    console.error("[Web Push] Error sending push notifications:", err.message);
    return false;
  }
};
