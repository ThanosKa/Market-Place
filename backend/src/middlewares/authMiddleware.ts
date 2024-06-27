// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY as string;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
