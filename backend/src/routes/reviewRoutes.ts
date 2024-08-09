// routes/reviewRoutes.ts
import express from "express";
import { auth } from "../middleware/auth";
import {
  createReview,
  deleteReview,
  getReviewsForLoggedUser,
  getReviewsForUser,
  getReviewsDoneByUser,
  updateReview,
} from "../controllers/reviewController";

const router = express.Router();

router.post("/", auth, createReview);
router.put("/:reviewId", auth, updateReview);
router.delete("/:reviewId", auth, deleteReview);
router.get("/", auth, getReviewsForLoggedUser);
router.get("/user/:userId", getReviewsForUser);
router.get("/done-by/:userId", getReviewsDoneByUser);

export default router;
