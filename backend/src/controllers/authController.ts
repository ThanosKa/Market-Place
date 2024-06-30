import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { emailSchema } from "../utils/email";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    // Validate email
    try {
      await emailSchema.validate(email);
    } catch (error) {
      return res.status(400).json({
        success: 0,
        message: "Invalid email address",
        data: null,
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: 0,
        message: "Passwords do not match",
        data: null,
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: 0,
        message: "User already exists",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user.id },
      process.env.SECRET_KEY as string,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: 1,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    try {
      await emailSchema.validate(email);
    } catch (error) {
      return res.status(400).json({
        success: 0,
        message: "Invalid email address",
        data: null,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: 0,
        message: "Invalid credentials",
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: 0,
        message: "Invalid credentials",
        data: null,
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.SECRET_KEY as string,
      { expiresIn: "1h" }
    );

    res.json({
      success: 1,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    // Here you would typically generate a password reset token and send an email
    // For this example, we'll just return a success message

    res.json({
      success: 1,
      message: "Password reset instructions sent to email",
      data: { email },
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
