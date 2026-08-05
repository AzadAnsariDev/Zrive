import inventoryModel from "../models/inventory.model.js";
import productModel from "../models/product.model.js"

export const deductStock = async ({ productId, variantId, quantity, orderId, performedBy, session }) => {

  const updated = await productModel.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          _id: variantId,
          stock: { $gte: quantity },
        },
      },
    },
    {
      $inc: {
        "variants.$.stock": -quantity,
      },
    },
    {
      new: true,
      session,
    }
  );

  if (!updated) {
    throw new Error(`Insufficient stock for variant ${variantId}`);
  }

  const variant = updated.variants.id(variantId)
  const previousStock = variant.stock + quantity

  await inventoryModel.create(
    [
      {
        product: productId,
        variantId,
        order: orderId,
        type: "deduction",
        quantityChange: -quantity,
        previousStock,
        newStock: variant.stock,
        reason: "order_confirmed",
        performedBy,
      },
    ],
    { session },
  );

  return variant

}

export const restoreStock = async ({ productId, variantId, quantity, orderId, reason, performedBy, session }) => {
  const updated = await productModel.findOneAndUpdate(
    { _id: productId, "variants._id": variantId },
    { $inc: { "variants.$.stock": quantity } },
    { session, new: true },
  );

  if (!updated) {
    throw new Error(`Variant ${variantId} not found while restoring stock`);
  }

  const variant = updated.variants.id(variantId);
  const previousStock = variant.stock - quantity;

  await inventoryModel.create(
    [
      {
        product: productId,
        variantId,
        order: orderId,
        type: "restoration",
        quantityChange: quantity,
        previousStock,
        newStock: variant.stock,
        reason,
        performedBy,
      },
    ],
    { session },
  );

  return variant;
};