import mongoose from "mongoose";
import reviewModel from "../models/review.model.js";
import productModel from "../models/product.model.js";
import { verifyPurchase } from "../services/review.service.js";

// ── Rating aggregation helper ─────────────────────────────
const recalculateProductRating = async (productId) => {
  const stats = await reviewModel.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
  ]);

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalCount = 0;
  let totalSum = 0;

  stats.forEach((s) => {
    breakdown[s._id] = s.count;
    totalCount += s.count;
    totalSum += s._id * s.count;
  });

  const avgRating = totalCount > 0 ? +(totalSum / totalCount).toFixed(1) : 0;

  await productModel.findByIdAndUpdate(productId, {
    avgRating,
    totalReviews: totalCount,
    ratingBreakdown: breakdown,
  });
};

// ── Create Review ──────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: "Rating is required" });
    }

    const { eligible, order, variantId } = await verifyPurchase({
      userId: req.user.id,
      productId,
    });

    if (!eligible) {
      return res.status(403).json({
        success: false,
        message: "You can only review delivered products you've purchased",
      });
    }

    const review = await reviewModel.create({
      product: productId,
      user: req.user.id,
      order: order._id,
      variantId,
      rating,
      title,
      comment,
    });

    await recalculateProductRating(productId);

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You've already reviewed this product",
      });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Reviews (paginated + sorted + filtered) ────────────
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = "recent", star } = req.query;

    const filter = { product: productId };
    if (star) filter.rating = Number(star);

    const sortMap = {
      recent: { createdAt: -1 },
      helpful: { helpfulCount: -1 },
    };

    const reviews = await reviewModel
      .find(filter)
      .populate("user", "name")
      .sort(sortMap[sort] || sortMap.recent)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await reviewModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Toggle Helpful ──────────────────────────────────────────
export const toggleHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const alreadyMarked = review.helpfulBy.some((id) => id.toString() === userId);

    if (alreadyMarked) {
      review.helpfulBy.pull(userId);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulBy.push(userId);
      review.helpfulCount += 1;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      helpfulCount: review.helpfulCount,
      marked: !alreadyMarked,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Seller Reply ─────────────────────────────────────────────
export const replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Reply text is required" });
    }

    const review = await reviewModel.findById(reviewId).populate("product");
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.product.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    review.sellerReply = { text, repliedAt: new Date() };
    await review.save();

    return res.status(200).json({ success: true, message: "Reply added", review });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Review (user apna hi delete kar sake) ────────────
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewModel.findOneAndDelete({
      _id: reviewId,
      user: req.user.id,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await recalculateProductRating(review.product);

    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Check eligibility (frontend "Write a Review" button ke liye) ──
export const checkEligibility = async (req, res) => {
  try {
    const { productId } = req.params;

    const { eligible } = await verifyPurchase({
      userId: req.user.id,
      productId,
    });

    const alreadyReviewed = await reviewModel.exists({
      product: productId,
      user: req.user.id,
    });

    return res.status(200).json({
      success: true,
      canReview: eligible && !alreadyReviewed,
      alreadyReviewed: !!alreadyReviewed,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};