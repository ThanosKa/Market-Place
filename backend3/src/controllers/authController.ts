// src/controllers/authController.ts

import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import User from "../model/User";

console.log("AuthController loaded"); // Add this line

const SECRET_KEY = process.env.SECRET_KEY as string;
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  status: number;
}

const sendResponse = (
  res: Response,
  { success, message, data, status }: ApiResponse
) => {
  res.status(status).json({ success, message, data });
};

console.log("New authController loaded"); // Add this line at the top of the file

// src/controllers/authController.ts

console.log("AuthController loaded - Version 1"); // Add this line
// src/controllers/authController.ts

console.log("AuthController loaded - Version 2");

export const register = async (req: Request, res: Response) => {
  console.log("Register function called - Version 2");
  try {
    const { email, password, confirmPassword, firstName, lastName } = req.body;
    console.log("Registration attempt for email:", email);

    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      console.log("Missing required fields");
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        status: 400,
      });
    }

    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
        status: 400,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
        status: 409,
      });
    }

    const user = new User({ email, password, firstName, lastName });
    await user.save();

    console.log("New user registered:", email);

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1d",
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { token },
      status: 201,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
      status: 500,
    });
  }
};

// ... rest of your authController.ts code

// ... rest of your authController.ts code

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, {
        success: false,
        message: "Email and password are required",
        status: 400,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return sendResponse(res, {
        success: false,
        message: "Invalid email or password",
        status: 401, // Unauthorized
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendResponse(res, {
        success: false,
        message: "Invalid email or password",
        status: 401, // Unauthorized
      });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1d",
    });

    sendResponse(res, {
      success: true,
      message: "Login successful",
      data: { token },
      status: 200,
    });
  } catch (error) {
    console.error("Login error:", error);
    sendResponse(res, {
      success: false,
      message: "An error occurred during login",
      status: 500,
    });
  }
};
