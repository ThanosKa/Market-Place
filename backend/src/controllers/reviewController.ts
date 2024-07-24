// controllers/reviewController.ts
import { Request, Response } from "express";
import Review from "../models/Review";
import User from "../models/User";
import Product from "../models/Product"; // Assuming you have a Product model
import { createActivity } from "./activityController";
import mongoose from "mongoose";

export const createReview = async (req: Request, res: Response) => {
  try {
    const { revieweeId, productId, rating, comment } = req.body;
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

    // Check if productId is valid and belongs to the reviewee
    const product = await Product.findOne({
      _id: productId,
      seller: revieweeId,
    });
    if (!product) {
      return res.status(404).json({
        success: 0,
        message: "Product not found or doesn't belong to the reviewee",
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
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: 0,
        message: "You have already reviewed this product for this user",
        data: null,
      });
    }

    const newReview = new Review({
      reviewer: reviewerId,
      reviewee: revieweeId,
      product: productId,
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

    // Populate the reviewer and product information
    const populatedReview = await Review.findById(newReview._id)
      .populate("reviewer", "firstName lastName email username profilePicture")
      .populate("product", "title images");

    // Create an activity for the reviewee
    await createActivity(
      revieweeId,
      "review",
      reviewerId,
      `New review for product ${product.title}: ${comment.substring(0, 50)}${
        comment.length > 50 ? "..." : ""
      }`,
      newReview._id.toString()
    );

    res.status(201).json({
      success: 1,
      message: "Review created successfully",
      data: { review: populatedReview },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ reviewer: userId })
      .populate("reviewee", "firstName lastName profilePicture")
      .populate("product", "title images")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalReviews = await Review.countDocuments({ reviewer: userId });

    res.json({
      success: 1,
      message: "User reviews retrieved successfully",
      data: {
        reviews,
        page: Number(page),
        limit: Number(limit),
        totalReviews,
        totalPages: Math.ceil(totalReviews / Number(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};
export const getReviewsForUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "firstName lastName profilePicture")
      .populate("product", "title images")
      .sort({ [sort as string]: order as mongoose.SortOrder })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalReviews = await Review.countDocuments({ reviewee: userId });

    res.json({
      success: 1,
      message: "Reviews retrieved successfully",
      data: {
        reviews,
        page: Number(page),
        limit: Number(limit),
        totalReviews,
        totalPages: Math.ceil(totalReviews / Number(limit)),
      },
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
