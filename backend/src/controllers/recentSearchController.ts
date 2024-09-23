import { Request, Response } from "express";
import RecentSearch, { IRecentSearch } from "../models/RecentSearch";
import mongoose from "mongoose";
import Product from "../models/Product";
import { formatProductData } from "../utils/formatImagesUrl";

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

    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({
          success: 0,
          message: "Invalid productId",
          data: null,
        });
      }

      const existingSearch = await RecentSearch.findOneAndUpdate(
        { user: userId, product: productId },
        { $set: { query, createdAt: new Date() } },
        { new: true, upsert: true }
      );

      return res.status(200).json({
        success: 1,
        message: "Recent search updated successfully",
        data: { recentSearch: existingSearch },
      });
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const recentSearches = await RecentSearch.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("product", "title price condition images");

    const formattedSearches = recentSearches.map((search) => ({
      ...search.toObject(),
      product: search.product ? formatProductData(search.product) : null,
    }));

    const total = await RecentSearch.countDocuments({ user: userId });

    res.json({
      success: 1,
      message: "Recent searches retrieved successfully",
      data: {
        recentSearches: formattedSearches,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
      data: { deletedCount: result.deletedCount },
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
