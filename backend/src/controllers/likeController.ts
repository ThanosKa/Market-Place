import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Product from "../models/Product";

import { createActivity } from "./activityController";
import Activity from "../models/Activity";
import { formatUserData } from "../utils/formatUserData";
import { formatProductData, formatUser } from "../utils/formatImagesUrl";

export const toggleLikeProduct = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const productId = new mongoose.Types.ObjectId(req.params.productId);

    const [user, product] = await Promise.all([
      User.findById(userId),
      Product.findById(productId).populate(
        "seller",
        "firstName lastName username"
      ),
    ]);

    if (!product) {
      return res
        .status(404)
        .json({ success: 0, message: "Product not found", data: null });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: 0, message: "User not found", data: null });
    }

    const productLikedIndex = product.likes.indexOf(userId);
    const userLikedProductIndex = user.likedProducts.indexOf(productId);

    let liked: boolean;

    if (productLikedIndex > -1) {
      // User has already liked the product, so unlike it
      product.likes.splice(productLikedIndex, 1);
      user.likedProducts.splice(userLikedProductIndex, 1);
      liked = false;

      // Remove the activity when unliking
      await Activity.findOneAndDelete({
        user: product.seller._id,
        type: "product_like",
        sender: userId,
        product: productId,
      });
    } else {
      // User hasn't liked the product, so like it
      product.likes.push(userId);
      user.likedProducts.push(productId);
      liked = true;

      // Create an activity for the product seller
      if (product.seller && !product.seller._id.equals(userId)) {
        await createActivity(
          product.seller._id.toString(),
          "product_like",
          userId.toString(),
          `${user.firstName} ${user.lastName} liked your product: ${product.title}`,
          productId.toString()
        );
      }
    }

    await Promise.all([product.save(), user.save()]);

    res.json({
      success: 1,
      message: "Product like toggled successfully",
      data: { liked, product: formatProductData(product) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};

export const toggleLikeUser = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const likedUserId = new mongoose.Types.ObjectId(req.params.likedUserId);

    if (userId.equals(likedUserId)) {
      return res
        .status(400)
        .json({ success: 0, message: "You cannot like yourself", data: null });
    }

    const [user, likedUser] = await Promise.all([
      User.findById(userId),
      User.findById(likedUserId),
    ]);

    if (!user || !likedUser) {
      return res
        .status(404)
        .json({ success: 0, message: "User not found", data: null });
    }

    const likedIndex = user.likedUsers.indexOf(likedUserId);
    let liked: boolean;

    if (likedIndex > -1) {
      // User has already liked the other user, so unlike
      user.likedUsers.splice(likedIndex, 1);
      liked = false;

      // Remove the activity when unliking
      await Activity.findOneAndDelete({
        user: likedUserId,
        type: "profile_like",
        sender: userId,
      });
    } else {
      // User hasn't liked the other user, so like
      user.likedUsers.push(likedUserId);
      liked = true;

      // Create an activity for the liked user
      await createActivity(
        likedUserId.toString(),
        "profile_like",
        userId.toString(),
        `${user.firstName} ${user.lastName} liked your profile`
      );
    }
    await user.save();

    res.json({
      success: 1,
      message: "User like toggled successfully",
      data: { liked, likedUser: formatUser(likedUser) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};

export const getLikedProducts = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const user = await User.findById(userId)
      .select("likedProducts")
      .populate({
        path: "likedProducts",
        model: Product,
        select:
          "title price images category condition seller createdAt updatedAt",
        populate: {
          path: "seller",
          model: User,
          select: "firstName lastName profilePicture",
        },
      });

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    const formattedLikedProducts = formatProductData(user.likedProducts);

    // Additional check to ensure seller data is properly formatted
    const finalFormattedProducts = formattedLikedProducts.map(
      (product: any) => {
        if (product.seller && typeof product.seller === "object") {
          const formattedSeller = formatUser(product.seller);
          return {
            ...product,
            seller: formattedSeller || product.seller, // Fall back to original seller if formatUser returns null
          };
        }
        return product;
      }
    );

    res.json({
      success: 1,
      message: "Liked products retrieved successfully",
      data: { likedProducts: finalFormattedProducts },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};

export const getLikedProfiles = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const user = await User.findById(userId)
      .select("likedUsers")
      .populate({
        path: "likedUsers",
        model: User,
        select: "firstName lastName profilePicture averageRating reviewCount",
        populate: {
          path: "products",
          model: Product,
          select: "_id images",
        },
      });

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    const formattedLikedUsers = user.likedUsers.map((likedUser: any) => {
      const formattedUser = formatUser(likedUser);

      if (typeof formattedUser === "string") {
        // If formatUser returned a string (user ID), use the original likedUser data
        return {
          _id: formattedUser,
          firstName: likedUser.firstName,
          lastName: likedUser.lastName,
          profilePicture: likedUser.profilePicture,
          averageRating: likedUser.averageRating,
          reviewCount: likedUser.reviewCount,
          products: formatProductData(likedUser.products),
        };
      } else if (formattedUser) {
        // If formatUser returned an object, use its properties
        return {
          _id: formattedUser._id,
          firstName: formattedUser.firstName,
          lastName: formattedUser.lastName,
          profilePicture: formattedUser.profilePicture,
          averageRating: likedUser.averageRating,
          reviewCount: likedUser.reviewCount,
          products: formatProductData(likedUser.products),
        };
      } else {
        // If formatUser returned null, use the original likedUser data
        return {
          _id: likedUser._id,
          firstName: likedUser.firstName,
          lastName: likedUser.lastName,
          profilePicture: likedUser.profilePicture,
          averageRating: likedUser.averageRating,
          reviewCount: likedUser.reviewCount,
          products: formatProductData(likedUser.products),
        };
      }
    });

    res.json({
      success: 1,
      message: "Liked profiles retrieved successfully",
      data: { likedUsers: formattedLikedUsers },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};
