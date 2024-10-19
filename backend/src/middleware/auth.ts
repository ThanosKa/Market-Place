import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokenUtils";

interface AuthRequest extends Request {
  userId?: string;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");
  // console.log("Auth header:", authHeader); // Debug log

  if (!authHeader) {
    return res.status(401).json({
      success: 0,
      message: "No token, authorization denied",
      data: null,
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: 0,
      message: "Invalid token format",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];
  // console.log("Extracted token:", token); // Debug log

  try {
    const decoded = verifyAccessToken(token);
    // console.log("Decoded token:", decoded); // Debug log
    if (!decoded) {
      throw new Error("Invalid token");
    }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Auth error:", err); // Debug log
    res.status(401).json({
      success: 0,
      message: "Token is not valid",
      data: null,
    });
  }
};
