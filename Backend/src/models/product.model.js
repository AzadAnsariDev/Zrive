import mongoose, { mongo } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        enum: ["USD", "INR", "JPY", "EUR", "GBP"],
        default: "INR",
      },
    },
    status: {
      type: String,
      enum: ["In-Stock", "Out of Stock"],
    },
    category: {
      type: String,
      enum: [
        "T-Shirts",
        "Shirts",
        "Jeans",
        "Trousers",
        "Shorts",
        "Jackets",
        "Hoodies",
        "Sweatshirts",
        "Blazers",
        "Ethnic Wear",
      ],
      required: true,
    },
    stock:{
        type: Number,
        required: true
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const productModel = mongoose.model("products", productSchema);

export default productModel;
