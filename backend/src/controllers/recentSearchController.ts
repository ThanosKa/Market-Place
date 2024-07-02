import { Request, Response } from "express";
import RecentSearch, { IRecentSearch } from "../models/RecentSearch";
import mongoose from "mongoose";
import Product from "../models/Product"; // Import the Product model
export const addRecentSearch = async (req: Request, res: Response) => {
  try {
    const { query, productId } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: 0,
        message: "Unauthorized: User ID not found",
        data: null,
      });
    }

    if (!query) {
      return res.status(400).json({
        success: 0,
        message: "Query is required",
        data: null,
      });
    }

    // Check if the product exists
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({
          success: 0,
          message: "Invalid productId",
          data: null,
        });
      }

      // Check if a recent search for this product already exists
      const existingSearch = await RecentSearch.findOne({
        user: userId,
        product: productId,
      });

      if (existingSearch) {
        return res.status(200).json({
          success: 1,
          message: "Recent search for this product already exists",
          data: { recentSearch: existingSearch },
        });
      }
    }

    const newRecentSearch: IRecentSearch = new RecentSearch({
      user: new mongoose.Types.ObjectId(userId),
      query,
      product: productId ? new mongoose.Types.ObjectId(productId) : null,
    });

    await newRecentSearch.save();

    res.status(201).json({
      success: 1,
      message: "Recent search added successfully",
      data: { recentSearch: newRecentSearch },
    });
  } catch (error) {
    console.error("Error in addRecentSearch:", error);
    res
      .status(500)
      .json({ success: 0, message: "Failed to add recent search", data: null });
  }
};
export const getRecentSearches = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const recentSearches = await RecentSearch.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("product", "title price condition images");

    res.json({
      success: 1,
      message: "Recent searches retrieved successfully",
      data: { recentSearches },
    });
  } catch (error) {
    console.error("Error in getRecentSearches:", error);
    res.status(500).json({
      success: 0,
      message: "Failed to retrieve recent searches",
      data: null,
    });
  }
};

export const deleteRecentSearch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: 0, message: "Invalid search ID", data: null });
    }

    const deletedSearch = await RecentSearch.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedSearch) {
      return res
        .status(404)
        .json({ success: 0, message: "Recent search not found", data: null });
    }

    res.json({
      success: 1,
      message: "Recent search deleted successfully",
      data: { deletedSearch },
    });
  } catch (error) {
    console.error("Error in deleteRecentSearch:", error);
    res.status(500).json({
      success: 0,
      message: "Failed to delete recent search",
      data: null,
    });
  }
};

export const deleteAllRecentSearches = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await RecentSearch.deleteMany({ user: userId });

    if (result.deletedCount === 0) {
      return res.json({
        success: 1,
        message: "No recent searches found to delete",
        data: null,
      });
    }

    res.json({
      success: 1,
      message: "All recent searches deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error in deleteAllRecentSearches:", error);
    res.status(500).json({
      success: 0,
      message: "Failed to delete all recent searches",
      data: null,
    });
  }
};
