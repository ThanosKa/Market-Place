import { Request, Response } from "express";
import User from "../models/User";
import Product, { IProduct } from "../models/Product";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { emailSchema } from "../utils/email";
import Activity from "../models/Activity";

import Review from "../models/Review";
import { formatUserData } from "../utils/formatUserData";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
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
      });

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
      data: { users: formattedUsers },
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

    const user = await User.findById(req.params.id)
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

    const reviews = await Review.find({ reviewee: user._id })
      .populate("reviewer", "firstName lastName profilePicture")
      .populate("product")
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
      seller: user._id,
      ...productFilter,
    });

    res.json({
      success: 1,
      message: "User retrieved successfully",
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

    const reviews = await Review.find({ reviewee: user._id })
      .populate("reviewer", "firstName lastName profilePicture")
      .populate("product")
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
    } = req.body;
    const profilePicture = req.file;

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
        // Check if the new email already exists
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
    if (profilePicture) user.profilePicture = profilePicture.path;

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
