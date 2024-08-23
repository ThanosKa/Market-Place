import { Request, Response } from "express";
import User from "../models/User";
import Product, { IProduct } from "../models/Product";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { emailSchema } from "../utils/email";
import Activity from "../models/Activity";
import path from "path";
import fs from "fs";
import Review from "../models/Review";
import { formatUserData, formatUserProfileData } from "../utils/formatUserData";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .populate({
        path: "products",
        model: Product,
      })
      .populate({
        path: "likedProducts",
        model: Product,
      })
      .populate({
        path: "likedUsers",
        model: User,
        select: "-password",
      })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    const usersWithReviewsAndActivities = await Promise.all(
      users.map(async (user) => {
        const reviews = await Review.find({ reviewee: user._id })
          .populate("reviewer", "firstName lastName profilePicture")
          .populate("product")
          .sort({ createdAt: -1 });

        const activities = await Activity.find({ user: user._id })
          .populate("sender", "firstName lastName profilePicture")
          .populate("product")
          .sort({ createdAt: -1 });

        const unseenActivitiesCount = await Activity.countDocuments({
          user: user._id,
          read: false,
        });

        return {
          ...user.toObject(),
          reviews,
          activities: {
            items: activities,
            unseenCount: unseenActivitiesCount,
          },
        };
      })
    );

    const formattedUsers = usersWithReviewsAndActivities.map(formatUserData);

    res.json({
      success: 1,
      message: "Users retrieved successfully",
      data: {
        users: formattedUsers,
        total,
        page,
        limit,
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

export const editUser = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);

    const {
      email,
      firstName,
      lastName,
      bio,
      currentPassword,
      newPassword,
      confirmNewPassword,
      removeProfilePicture,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    // Update email if provided
    if (email && email !== user.email) {
      try {
        await emailSchema.validate(email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: 0,
            message: "Email already exists",
            data: null,
          });
        }
        user.email = email;
      } catch (error) {
        return res.status(400).json({
          success: 0,
          message: "Invalid email address",
          data: null,
        });
      }
    }

    // Update other fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;

    // Handle profile picture update or removal
    if (removeProfilePicture === "true") {
      if (user.profilePicture) {
        const fullPath = path.join(process.cwd(), user.profilePicture);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      user.profilePicture = null;
    } else if (req.file) {
      // Remove old profile picture if it exists
      if (user.profilePicture) {
        const fullPath = path.join(process.cwd(), user.profilePicture);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      user.profilePicture = path.join("uploads", req.file.filename);
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: 0,
          message: "Current password is required to change password",
          data: null,
        });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          success: 0,
          message: "Current password is incorrect",
          data: null,
        });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          success: 0,
          message: "New passwords do not match",
          data: null,
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.json({
      success: 1,
      message: "User updated successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          profilePicture: user.profilePicture,
        },
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
export const removeProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    user.profilePicture = null;
    await user.save();

    res.json({
      success: 1,
      message: "Profile picture removed successfully",
      data: {
        user: {
          id: user.id,
          profilePicture: user.profilePicture,
        },
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
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    res.json({
      success: 1,
      message: "User deleted successfully",
      data: null,
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
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    const formattedUser = formatUserProfileData(user);

    // Get total products count
    const totalProducts = await Product.countDocuments({ seller: userId });

    // Get total likes received from other users
    const totalLikes = await User.countDocuments({ likedUsers: userId });

    res.json({
      success: 1,
      message: "User details retrieved successfully",
      data: {
        user: formattedUser,
        totalProducts,
        totalLikes,
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

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    const formattedUser = formatUserProfileData(user);

    // Get total products count
    const totalProducts = await Product.countDocuments({ seller: user._id });

    // Get total likes received from other users
    const totalLikes = await User.countDocuments({ likedUsers: user._id });

    res.json({
      success: 1,
      message: "User retrieved successfully",
      data: {
        user: formattedUser,
        totalProducts,
        totalLikes,
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

export const getAllUsersInfo = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const loggedInUserId = new mongoose.Types.ObjectId((req as any).userId);

    // Create a filter object
    const filter: any = {
      _id: { $ne: loggedInUserId }, // Exclude the logged-in user
    };

    // Add search filter if provided
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("email firstName lastName profilePicture bio")
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    const formattedUsers = await Promise.all(
      users.map(async (user) => {
        const reviews = await Review.find({ reviewee: user._id });
        const reviewCount = reviews.length;
        const averageRating =
          reviewCount > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviewCount
            : 0;

        // Get total products count for the user
        const totalProducts = await User.countDocuments({ seller: user._id });

        // Get total likes received from other users
        const totalLikes = await User.countDocuments({ likedUsers: user._id });

        return {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          reviewCount,
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalProducts,
          totalLikes,
        };
      })
    );

    res.json({
      success: 1,
      message: "Users info retrieved successfully",
      data: {
        users: formattedUsers,
        total,
        page,
        limit,
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

export const getLoggedInUser = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const productFilter: mongoose.FilterQuery<IProduct> = {};

    if (typeof search === "string") {
      productFilter.title = { $regex: search, $options: "i" };
    }
    if (category) {
      productFilter.category = {
        $in: Array.isArray(category) ? category : [category],
      };
    }
    if (typeof condition === "string") {
      productFilter.condition = condition;
    }
    if (minPrice || maxPrice) {
      productFilter.price = {};
      if (minPrice) productFilter.price.$gte = Number(minPrice);
      if (maxPrice) productFilter.price.$lte = Number(maxPrice);
    }

    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "products",
        match: productFilter,
        options: {
          sort: { [sort as string]: order as mongoose.SortOrder },
          skip: (Number(page) - 1) * Number(limit),
          limit: Number(limit),
        },
        model: Product,
      })
      .populate({
        path: "likedProducts",
        model: Product,
      })
      .populate({
        path: "likedUsers",
        model: User,
        select: "-password",
        populate: {
          path: "products",
          model: Product,
          select:
            "title price images category condition seller likes createdAt updatedAt",
        },
      });
    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    const reviews = await Review.find({
      $or: [{ reviewer: userId }, { reviewee: userId }],
    })
      .populate("reviewer", "firstName lastName profilePicture")
      .populate("reviewee", "firstName lastName profilePicture")
      .populate("product", "title images")
      .sort({ createdAt: -1 });

    const activities = await Activity.find({ user: user._id })
      .populate("sender", "firstName lastName profilePicture")
      .populate("product", "title images")
      .sort({ createdAt: -1 });

    const unseenActivitiesCount = await Activity.countDocuments({
      user: user._id,
      read: false,
    });

    const userWithReviewsAndActivities = {
      ...user.toObject(),
      createdAt: user.createdAt,
      reviews,
      activities: {
        items: activities,
        unseenCount: unseenActivitiesCount,
      },
    };
    const formattedUser = formatUserData(userWithReviewsAndActivities);

    const totalProducts = await Product.countDocuments({
      seller: userId,
      ...productFilter,
    });

    res.json({
      success: 1,
      message: "Logged in user retrieved successfully",
      data: {
        user: formattedUser,
        page: Number(page),
        limit: Number(limit),
        totalProducts,
        totalPages: Math.ceil(totalProducts / Number(limit)),
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
