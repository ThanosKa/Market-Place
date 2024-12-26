import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { emailSchema } from "../utils/email";
import {
  createAccessToken,
  createAuthorizationCode,
  createRefreshToken,
  verifyAuthorizationCode,
} from "../utils/tokenUtils";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, confirmPassword, firstName, lastName } =
      req.body;

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

    // Check existing user
    let existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: 0,
        message: "User with this email or username already exists",
        data: null,
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      username,
      password, // Password will be hashed by the Schema middleware
      firstName,
      lastName,
      balance: 0,
    });

    await user.save();

    // Generate token
    const token = createAuthorizationCode(user.id);

    res.status(201).json({
      success: 1,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        success: 0,
        message: "Login and password are required",
        data: null,
      });
    }

    // Find user
    const user: IUser | null = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { username: login }],
    });

    // Verify user and password
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({
        success: 0,
        message: "Invalid credentials",
        data: null,
      });
    }

    // Generate tokens
    const authCode = createAuthorizationCode(user.id);
    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    res.json({
      success: 1,
      message: "Login successful",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: 3600,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance,
        },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};

export const exchangeToken = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // Verify the authorization code
    const userId = verifyAuthorizationCode(code);

    if (!userId) {
      return res.status(400).json({
        success: 0,
        message: "Invalid authorization code",
        data: null,
      });
    }

    // Generate access token and refresh token
    const accessToken = createAccessToken(userId);
    const refreshToken = createRefreshToken(userId);

    res.json({
      success: 1,
      message: "Token exchange successful",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: 3600, // 1 hour
      },
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({
        success: 0,
        message: "Token exchange error: " + err.message,
        data: null,
      });
    } else {
      res.status(500).json({
        success: 0,
        message: "An unknown error occurred during token exchange",
        data: null,
      });
    }
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
