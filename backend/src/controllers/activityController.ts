import { Request, Response } from "express";
import Activity, {
  ActivityType,
  ActivityTypes,
  IActivity,
} from "../models/Activity";
import mongoose from "mongoose";
import Product from "../models/Product";
import User from "../models/User";
import Review from "../models/Review";
import { formatProductData, formatUser } from "../utils/formatImagesUrl";

export const createActivity = async (
  userId: string,
  type: ActivityType,
  senderId: string,
  content: string,
  productId?: string
) => {
  try {
    if (userId === senderId) {
      console.log("Skipping activity creation: User is the sender");
      return null;
    }

    const activityData = {
      user: new mongoose.Types.ObjectId(userId),
      type,
      sender: new mongoose.Types.ObjectId(senderId),
      content,
      product: productId ? new mongoose.Types.ObjectId(productId) : undefined,
      read: false,
      createdAt: new Date(),
      lastSentAt: new Date(),
    };

    const activity = await Activity.findOneAndUpdate(
      {
        user: activityData.user,
        type: activityData.type,
        sender: activityData.sender,
        product: activityData.product,
      },
      activityData,
      { upsert: true, new: true }
    );

    return activity;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const activitiesItems = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "firstName lastName profilePicture")
      .populate({
        path: "product",
        select: "title images purchaseRequest",
        populate: {
          path: "purchaseRequest.buyer",
          select: "firstName lastName profilePicture",
        },
      });

    const totalActivities = await Activity.countDocuments({ user: userId });
    const unseenCount = await Activity.countDocuments({
      user: userId,
      read: false,
    });

    const formattedActivities = activitiesItems.map((activity) => {
      const formattedActivity: any = {
        ...activity.toObject(),
        reviewStatus:
          activity.type === ActivityTypes.REVIEW_PROMPT
            ? activity.reviewDone
              ? "Reviewed"
              : "Pending"
            : undefined,
        sender: formatUser(activity.sender),
      };

      if (activity.product) {
        formattedActivity.product = formatProductData(activity.product);
        if (
          formattedActivity.product &&
          formattedActivity.product.purchaseRequest
        ) {
          formattedActivity.product.purchaseRequest.buyer = formatUser(
            formattedActivity.product.purchaseRequest.buyer
          );
        }
      }

      return formattedActivity;
    });

    res.json({
      success: 1,
      message: "Activities retrieved successfully",
      data: {
        activities: {
          items: formattedActivities,
          unseenCount,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalActivities / limit),
            totalItems: totalActivities,
            itemsPerPage: limit,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in getActivities:", error);
    res.status(500).json({
      success: 0,
      message: "Failed to retrieve activities",
      data: null,
    });
  }
};
export const markActivityAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const activity = await Activity.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({
        success: 0,
        message: "Activity not found",
        data: null,
      });
    }

    res.json({
      success: 1,
      message: "Activity marked as read",
      data: { activity },
    });
  } catch (error) {
    console.error("Error in markActivityAsRead:", error);
    res.status(500).json({
      success: 0,
      message: "Failed to mark activity as read",
      data: null,
    });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const activity = await Activity.findOneAndDelete({ _id: id, user: userId });

    if (!activity) {
      return res.status(404).json({
        success: 0,
        message: "Activity not found or you don't have permission to delete it",
        data: null,
      });
    }

    res.json({
      success: 1,
      message: "Activity deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error in deleteActivity:", error);
    res.status(500).json({
      success: 0,
      message: "Failed to delete activity",
      data: null,
    });
  }
};

export const markAllActivitiesAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await Activity.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    res.json({
      success: 1,
      message: "All activities marked as read",
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Error in markAllActivitiesAsRead:", error);
    res.status(500).json({
      success: 0,
      message: "Failed to mark all activities as read",
      data: null,
    });
  }
};

export const createReviewPromptActivity = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId } = req.body;
    const sellerId = (req as any).userId; // Assuming you're using the auth middleware

    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: 0,
        message: "Product ID is required",
        data: null,
      });
    }

    // Check if the product exists, belongs to the seller, and has been sold
    const product = await Product.findOne({
      _id: productId,
      seller: sellerId,
      "sold.to": { $ne: null },
    }).populate("sold.to", "firstName lastName profilePicture");

    if (!product) {
      return res.status(404).json({
        success: 0,
        message:
          "Product not found, does not belong to the seller, or has not been sold",
        data: null,
      });
    }

    const buyerId = product.sold?.to;

    if (!buyerId) {
      return res.status(400).json({
        success: 0,
        message: "Buyer information not available",
        data: null,
      });
    }

    // Check if the buyer has already created a review for this product
    const existingReview = await Review.findOne({
      reviewer: buyerId,
      product: productId,
    });

    if (existingReview) {
      return res.status(200).json({
        success: 1,
        message: "Buyer has already reviewed this product",
        data: 1,
      });
    }

    // Check if a review prompt activity already exists
    let existingActivity = await Activity.findOne({
      user: buyerId,
      type: "review_prompt",
      sender: sellerId,
      product: productId,
    });

    if (existingActivity) {
      if (!existingActivity.read) {
        return res.status(200).json({
          success: 1,
          message: "Review prompt activity already sent and not yet read",
          data: 0,
        });
      } else {
        // If the activity exists and has been read, update it
        existingActivity.read = false;
        existingActivity.createdAt = new Date();
        await existingActivity.save();

        const populatedActivity = await Activity.findById(existingActivity._id)
          .populate("user", "firstName lastName profilePicture")
          .populate({
            path: "product",
            select: "title price images category condition",
            populate: {
              path: "seller",
              select: "firstName lastName profilePicture",
            },
          });

        return res.status(200).json({
          success: 1,
          message: "Review prompt activity resent successfully",
          data: {
            activity: {
              ...populatedActivity!.toObject(),
              buyer: populatedActivity!.user,
              user: undefined,
            },
          },
        });
      }
    }

    // Create the review prompt activity
    const activityData = {
      user: buyerId,
      type: "review_prompt",
      sender: new mongoose.Types.ObjectId(sellerId),
      content: `Please leave a review for the product "${product.title}" you purchased.`,
      product: new mongoose.Types.ObjectId(productId),
      read: false,
      createdAt: new Date(),
    };

    const activity = await Activity.create(activityData);

    const populatedActivity = await Activity.findById(activity._id)
      .populate("user", "firstName lastName profilePicture")
      .populate({
        path: "product",
        select: "title price images category condition",
        populate: {
          path: "seller",
          select: "firstName lastName profilePicture",
        },
      });

    const seller = await User.findById(
      sellerId,
      "firstName lastName profilePicture"
    );
    const formattedActivity = {
      ...populatedActivity!.toObject(),
      buyer: formatUser(populatedActivity!.user),
      seller: formatUser(seller),
      product: formatProductData(populatedActivity!.product),
      user: undefined,
    };

    res.status(201).json({
      success: 1,
      message: "Review prompt activity created successfully",
      data: {
        activity: formattedActivity,
      },
    });
  } catch (error) {
    console.error("Error creating review prompt activity:", error);
    res.status(500).json({
      success: 0,
      message: "Failed to create review prompt activity",
      data: null,
    });
  }
};
