import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    price: {
      amount: { type: Number, required: true },
      currency: {
        type: String,
        enum: ["USD", "INR", "JPY", "EUR", "GBP"],
        default: "INR",
      },
    },
    status: {
      type: String,
      enum: ["In-Stock", "Out of Stock"],
      // no default here — this gets computed in the pre-save hook below
    },
    category: {
      type: String,
      enum: [
        "T-Shirts", "Shirts", "Jeans", "Trousers", "Shorts",
        "Jackets", "Hoodies", "Sweatshirts", "Blazers", "Ethnic Wear",
      ],
      required: true,
    },
    images: [{ url: { type: String, required: true } }],

    variants: {
      type: [
        {
          size: { type: String, required: true },
          color: { type: String, required: true },
          sku: { type: String, required: true, unique: true },
          stock: { type: Number, required: true, default: 0 },
          priceOverride: { type: Number, required: false },
          images: [{ url: { type: String, required: true } }],
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
  },
  { timestamps: true }
);

// auto-derive status from total variant stock — no manual setting needed
productSchema.pre("save", function () {
  const totalStock = this.variants.reduce((sum, v) => sum + v.stock, 0);
  this.status = totalStock > 0 ? "In-Stock" : "Out of Stock";
});

const productModel = mongoose.model("products", productSchema);
export default productModel;