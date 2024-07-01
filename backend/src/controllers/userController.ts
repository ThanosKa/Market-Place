import { Request, Response } from "express";
import User from "../models/User";
import Product from "../models/Product";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { emailSchema } from "../utils/email";

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
      });

    res.json({
      success: 1,
      message: "Users retrieved successfully",
      data: { users },
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
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "products",
        model: Product,
      })
      .populate({
        path: "likedProducts",
        model: Product,
      });

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    res.json({
      success: 1,
      message: "User retrieved successfully",
      data: { user },
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

    const { email, firstName, lastName, bio, newPassword, confirmNewPassword } =
      req.body;
    const profilePicture = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    // Validate and update email if it's being changed
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