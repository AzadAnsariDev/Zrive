import mongoose from "mongoose";
import priceSchema from "../models/price.schema.js";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sellers",
      required: true,
    },
    price: {
      type: priceSchema,
      required: true
    },
    status: {
      type: String,
      enum: ["In-Stock", "Out of Stock"],
      // no default here — this gets computed in the pre-save hook below
    },
    category: {
      type: String,
      enum: [
        "T-Shirts", "Shirts", "Jeans", "Trousers",
        "Jackets", "Blazers", "Hoodies", "Shoes",
        "Sunglasses", "Perfumes",
      ],
      required: true,
    },
    images: [{ url: { type: String, required: true } }],
    shippingDefaults: {
      weight: { type: Number, required: true },  // kg
      dimensions: {
        length: { type: Number, required: true }, // cm
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      }
    },
    variants: {
      type: [
        {
          size: { type: String, required: true },
          color: { type: String, required: true },
          sku: { type: String, required: true, unique: true },
          stock: { type: Number, required: true, default: 0 },
          price: { type: priceSchema, required: true },
          images: [{ url: { type: String, required: true } }],
          weight: { type: Number, default: null },
          dimensions: {
            length: { type: Number, default: null },
            width: { type: Number, default: null },
            height: { type: Number, default: null },
          }
        },
      ],
      validate: [
        {
          validator: (v) => Array.isArray(v) && v.length > 0,
          message: "Product must have at least one variant",
        },
        //Validate to check whether InStock or Out of Stock
        {
          validator: function (v) {
            const seen = new Set();
            for (const variant of v) {
              const key = `${variant.size}-${variant.color}`;
              if (seen.has(key)) return false;
              seen.add(key);
            }
            return true;
          },
          message: "Duplicate size+color combination found in variants",
        },
      ],
    },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    ratingBreakdown: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// auto-derive status from total variant stock — no manual setting needed
productSchema.pre("save", function () {
  const totalStock = this.variants.reduce((sum, v) => sum + v.stock, 0);
  this.status = totalStock > 0 ? "In-Stock" : "Out of Stock";
});

productSchema.pre("validate", function () {
  this.variants.forEach((variant) => {
    if (!variant.price || variant.price.amount == null) {
      variant.price = {
        amount: this.price?.amount,
        currency: this.price?.currency || "INR",
      };
    }
  });
});

const productModel = mongoose.model("products", productSchema);
export default productModel;