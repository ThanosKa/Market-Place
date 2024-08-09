// controllers/activityController.ts

import { Request, Response } from "express";
import Activity, { IActivity } from "../models/Activity";
import mongoose from "mongoose";
export const createActivity = async (
  userId: string,
  type: "message" | "product_like" | "profile_like" | "review",
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
    const activitiesItems = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName profilePicture")
      .populate("product", "title images");

    // Count unseen activities
    const unseenCount = await Activity.countDocuments({
      user: userId,
      read: false,
    });

    res.json({
      success: 1,
      message: "Activities retrieved successfully",
      data: {
        activities: {
          items: activitiesItems,
          unseenCount,
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
