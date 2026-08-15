import Wishlist from "../models/wishlist.model.js";
import productModel from "../models/product.model.js"; 

export const addToWishlist = async (req, res) => {
  try {
    const { productId, variantSku } = req.body;
    const userId = req.user.id; 

    if (!productId || !variantSku) {
      return res.status(400).json({ message: "productId and variantSku are required" });
    }

    const product = await productModel.findOne(
      { _id: productId, "variants.sku": variantSku },
      { _id: 1 }
    );
    if (!product) {
      return res.status(404).json({ message: "Product or variant not found" });
    }

    const wishlistItem = await Wishlist.create({
      user: userId,
      product: productId,
      variantSku,
    });

    return res.status(201).json({ message: "Added to wishlist", wishlistItem });
  } catch (err) {
    // Unique index (user + variantSku) throws this on a duplicate add —
    if (err.code === 11000) {
      return res.status(200).json({ message: "Already in wishlist" });
    }
    return res.status(500).json({ message: "Could not add to wishlist", error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { variantSku } = req.params;
    const userId = req.user.id;

    const deleted = await Wishlist.findOneAndDelete({ user: userId, variantSku });
    if (!deleted) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    return res.status(200).json({ message: "Removed from wishlist" });
  } catch (err) {
    return res.status(500).json({ message: "Could not remove from wishlist", error: err.message });
  }
};


export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await Wishlist.find({ user: userId })
      .populate("product")
      .sort({ createdAt: -1 });

    const validItems = items.filter((item) => item.product);

    const variantSkus = validItems.map((item) => item.variantSku);

    return res.status(200).json({ items: validItems, variantSkus });
  } catch (err) {
    return res.status(500).json({ message: "Could not fetch wishlist", error: err.message });
  }
};