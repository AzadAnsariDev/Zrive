import orderModel from "../models/order.model.js";

export const verifyPurchase = async ({ userId, productId }) => {
  const order = await orderModel.findOne({
    user: userId,
    orderStatus: "delivered",
    "orderItems.productId": productId,
  });

  if (!order) {
    return { eligible: false, order: null };
  }

  const item = order.orderItems.find(
    (i) => i.productId.toString() === productId.toString()
  );

  return {
    eligible: true,
    order,
    variantId: item.variantId,
  };
};