import { Request, Response } from "express";
import RecentSearch, { IPopulatedRecentSearch, IRecentSearch } from "../models/RecentSearch";
import mongoose from "mongoose";
import Product, { IProduct } from "../models/Product";
import { formatProductData } from "../utils/formatImagesUrl";
import User, { IUser } from "../models/User";
import { filePathToUrl } from "../utils/filterToUrl";
import { API_BASE_URL } from "../server";


interface AddRecentSearchBody {
  query: string;
  productId?: string;
  searchedUserId?: string;
}

export const addRecentSearch = async (req: Request<{}, {}, AddRecentSearchBody>, res: Response) => {
  try {
    const { query, productId, searchedUserId } = req.body;
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

    // Check if user is trying to search themselves
    if (searchedUserId && searchedUserId === userId) {
      return res.status(400).json({
        success: 0,
        message: "You cannot add yourself as a recent search",
        data: null,
      });
    }

    // Initialize search data
    const searchData: Partial<IRecentSearch> = {
      user: new mongoose.Types.ObjectId(userId),
      query,
    };

    // Validate and add product if provided
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({
          success: 0,
          message: "Invalid productId",
          data: null,
        });
      }
      searchData.product = new mongoose.Types.ObjectId(productId);
    }

    // Validate and add searched user if provided
    if (searchedUserId) {
      const searchedUser = await User.findById(searchedUserId);
      if (!searchedUser) {
        return res.status(400).json({
          success: 0,
          message: "Invalid searchedUserId",
          data: null,
        });
      }
      searchData.searchedUser = new mongoose.Types.ObjectId(searchedUserId);
    }

    // If neither product nor user is provided
    if (!productId && !searchedUserId) {
      return res.status(400).json({
        success: 0,
        message: "Either productId or searchedUserId must be provided",
        data: null,
      });
    }

    // Rest of the code remains the same...
    const existingSearch = await RecentSearch.findOneAndUpdate(
      {
        user: userId,
        ...(productId && { product: productId }),
        ...(searchedUserId && { searchedUser: searchedUserId }),
      },
      { $set: { ...searchData, createdAt: new Date() } },
      { new: true, upsert: true }
    ).populate([
      {
        path: 'product',
        select: 'title price condition images',
      },
      {
        path: 'searchedUser',
        select: 'firstName lastName username profilePicture averageRating reviewCount',
      }
    ]);

    const formattedSearch = {
      ...existingSearch.toObject(),
      product: existingSearch.product ? {
        title: (existingSearch.product as IProduct).title,
        price: (existingSearch.product as IProduct).price,
        condition: (existingSearch.product as IProduct).condition,
        images: (existingSearch.product as IProduct).images,
      } : null,
      searchedUser: existingSearch.searchedUser ? {
        firstName: (existingSearch.searchedUser as IUser).firstName,
        lastName: (existingSearch.searchedUser as IUser).lastName,
        username: (existingSearch.searchedUser as IUser).username,
        profilePicture: (existingSearch.searchedUser as IUser).profilePicture,
        averageRating: (existingSearch.searchedUser as IUser).averageRating,
        reviewCount: (existingSearch.searchedUser as IUser).reviewCount,
      } : null,
    };

    return res.status(200).json({
      success: 1,
      message: "Recent search updated successfully",
      data: { recentSearch: formattedSearch },
    });

  } catch (error) {
    console.error("Error in addRecentSearch:", error);
    res.status(500).json({
      success: 0,
      message: "Failed to add recent search",
      data: null,
    });
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
      .populate("product", "title price condition images")
      .populate("searchedUser", "firstName lastName username profilePicture averageRating reviewCount");

    const formattedSearches = recentSearches.map(search => {
      const baseSearch = {
        id: search._id,
        query: search.query,
        createdAt: search.createdAt,
      };

      // If it's a product search
      if (search.product) {
        return {
          ...baseSearch,
          type: 'product',
          product: {
            id: (search.product as any)._id,
            title: (search.product as any).title,
            price: (search.product as any).price,
            images: (search.product as any).images.map((image: string) => 
              filePathToUrl(image, API_BASE_URL)
            ),
            condition: (search.product as any).condition,
          }
        };
      }

      // If it's a user search
      if (search.searchedUser) {
        return {
          ...baseSearch,
          type: 'user',
          user: {
            id: (search.searchedUser as any)._id,
            firstName: (search.searchedUser as any).firstName,
            lastName: (search.searchedUser as any).lastName,
            username: (search.searchedUser as any).username,
            profilePicture: (search.searchedUser as any).profilePicture ? 
              filePathToUrl((search.searchedUser as any).profilePicture, API_BASE_URL) : 
              null,
            averageRating: (search.searchedUser as any).averageRating,
            reviewCount: (search.searchedUser as any).reviewCount,
          }
        };
      }

      return baseSearch;
    });

    const total = await RecentSearch.countDocuments({ user: userId });

    res.json({
      success: 1,
      message: "Recent searches retrieved successfully",
      data: {
        recentSearches: formattedSearches,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
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
