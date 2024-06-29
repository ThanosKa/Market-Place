// routes/reviewRoutes.ts
import express from "express";
import {
  createReview,
  deleteReview,
  getCurrentUserReviewForUser,
  getReviewsForUser,
  updateReview,
} from "../controllers/reviwController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createReview);
router.put("/:reviewId", auth, updateReview);
router.delete("/:reviewId", auth, deleteReview);
router.get("/user/:userId", getReviewsForUser);
router.get("/user/:userId/myreview", auth, getCurrentUserReviewForUser);

export default router;
