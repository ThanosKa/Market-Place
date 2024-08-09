import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  userId?: string;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({
      success: 0,
      message: "No token, authorization denied",
      data: null,
    });
  }

  // Check if authHeader starts with "Bearer "
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: 0,
      message: "Invalid token format",
      data: null,
    });
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as {
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({
      success: 0,
      message: "Token is not valid",
      data: null,
    });
  }
};
