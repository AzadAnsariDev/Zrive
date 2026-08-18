import { Router } from "express";
import {
  createReview,
  getProductReviews,
  toggleHelpful,
  replyToReview,
  deleteReview,
  checkEligibility,
} from "../controllers/review.controller.js";
import { authenticateUser, authenticateSeller } from "../middlewares/auth.middleware.js";

const reviewRouter = Router();

reviewRouter.post("/:productId", authenticateUser, createReview);
reviewRouter.get("/:productId", getProductReviews);
reviewRouter.get("/:productId/eligibility", authenticateUser, checkEligibility);
reviewRouter.patch("/helpful/:reviewId", authenticateUser, toggleHelpful);
reviewRouter.post("/reply/:reviewId", authenticateSeller, replyToReview);
reviewRouter.delete("/:reviewId", authenticateUser, deleteReview);

export default reviewRouter;