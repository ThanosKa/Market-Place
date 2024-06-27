// src/controllers/authController.ts
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import User from "../model/User";

const SECRET_KEY = process.env.SECRET_KEY as string;

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ email, password, firstName, lastName });
    await user.save();

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1d",
    });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1d",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};
