import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Product from "../models/Product";

export const toggleLikeProduct = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const productId = new mongoose.Types.ObjectId(req.params.productId);

    const [user, product] = await Promise.all([
      User.findById(userId),
      Product.findById(productId),
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

    if (productLikedIndex > -1) {
      // User has already liked the product, so unlike it
      product.likes.splice(productLikedIndex, 1);
      user.likedProducts.splice(userLikedProductIndex, 1);
    } else {
      // User hasn't liked the product, so like it
      product.likes.push(userId);
      user.likedProducts.push(productId);
    }

    await Promise.all([product.save(), user.save()]);

    res.json({
      success: 1,
      message: "Product like toggled successfully",
      data: { liked: productLikedIndex === -1 },
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

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: 0, message: "User not found", data: null });
    }

    const likedIndex = user.likedUsers.indexOf(likedUserId);
    if (likedIndex > -1) {
      // User has already liked the other user, so unlike
      user.likedUsers.splice(likedIndex, 1);
    } else {
      // User hasn't liked the other user, so like
      user.likedUsers.push(likedUserId);
    }

    await user.save();

    res.json({
      success: 1,
      message: "User like toggled successfully",
      data: { liked: likedIndex === -1 },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Server error", data: null });
  }
};
