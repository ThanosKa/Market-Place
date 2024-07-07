// controllers/reviewController.ts
import { Request, Response } from "express";
import Review from "../models/Review";
import User from "../models/User";

export const createReview = async (req: Request, res: Response) => {
  try {
    const { revieweeId, rating, comment } = req.body;
    const reviewerId = (req as any).userId;

    // Check if revieweeId is a valid user
    const reviewee = await User.findById(revieweeId);
    if (!reviewee) {
      return res.status(404).json({
        success: 0,
        message: "User to be reviewed not found",
        data: null,
      });
    }

    if (reviewerId === revieweeId) {
      return res.status(400).json({
        success: 0,
        message: "You cannot review yourself",
        data: null,
      });
    }

    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      reviewee: revieweeId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: 0,
        message: "You have already reviewed this user",
        data: null,
      });
    }

    const newReview = new Review({
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment,
    });

    await newReview.save();

    // Update user's average rating and review count
    const newTotalRating =
      reviewee.averageRating * reviewee.reviewCount + rating;
    const newReviewCount = reviewee.reviewCount + 1;
    reviewee.averageRating = newTotalRating / newReviewCount;
    reviewee.reviewCount = newReviewCount;
    await reviewee.save();

    res.status(201).json({
      success: 1,
      message: "Review created successfully",
      data: { review: newReview },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};
export const getReviewsForUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "firstName lastName profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: 1,
      message: "Reviews retrieved successfully",
      data: { reviews },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};
export const getCurrentUserReviewForUser = async (
  req: Request,
  res: Response
) => {
  try {
    const targetUserId = req.params.userId; // The user being reviewed
    const currentUserId = (req as any).userId; // The user who left the review

    const review = await Review.findOne({
      reviewer: currentUserId,
      reviewee: targetUserId,
    }).populate("reviewer", "firstName lastName profilePicture");

    if (!review) {
      return res.status(404).json({
        success: 0,
        message: "Review not found",
        data: null,
      });
    }

    res.json({
      success: 1,
      message: "Review retrieved successfully",
      data: { review },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = (req as any).userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: 0,
        message: "Review not found",
        data: null,
      });
    }

    if (review.reviewer.toString() !== reviewerId) {
      return res.status(403).json({
        success: 0,
        message: "You can only update your own reviews",
        data: null,
      });
    }

    const oldRating = review.rating;
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Update user's average rating
    const reviewee = await User.findById(review.reviewee);
    if (reviewee) {
      const newTotalRating =
        reviewee.averageRating * reviewee.reviewCount - oldRating + rating;
      reviewee.averageRating = newTotalRating / reviewee.reviewCount;
      await reviewee.save();
    }

    res.json({
      success: 1,
      message: "Review updated successfully",
      data: { review },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const reviewerId = (req as any).userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: 0,
        message: "Review not found",
        data: null,
      });
    }

    if (review.reviewer.toString() !== reviewerId) {
      return res.status(403).json({
        success: 0,
        message: "You can only delete your own reviews",
        data: null,
      });
    }

    // Update user's average rating and review count
    const reviewee = await User.findById(review.reviewee);
    if (reviewee) {
      const newTotalRating =
        reviewee.averageRating * reviewee.reviewCount - review.rating;
      const newReviewCount = reviewee.reviewCount - 1;
      reviewee.averageRating =
        newReviewCount > 0 ? newTotalRating / newReviewCount : 0;
      reviewee.reviewCount = newReviewCount;
      await reviewee.save();
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: 1,
      message: "Review deleted successfully",
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};
