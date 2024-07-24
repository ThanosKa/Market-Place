// routes/reviewRoutes.ts
import express from "express";

import { auth } from "../middleware/auth";
import {
  createReview,
  deleteReview,
  getCurrentUserReviewForUser,
  getReviewsForUser,
  getUserReviews,
  updateReview,
} from "../controllers/reviewController";

const router = express.Router();

router.post("/", auth, createReview);
router.put("/:reviewId", auth, updateReview);
router.delete("/:reviewId", auth, deleteReview);
router.get("/user/:userId", getReviewsForUser);
router.get("/", auth, getUserReviews);

router.get(
  "/user/:userId/product/:productId",
  auth,
  getCurrentUserReviewForUser
);
export default router;
