import { Request, Response } from "express";
import { verifyRefreshToken, createAccessToken } from "../utils/tokenUtils";

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      success: 0,
      message: "Refresh token is required",
      data: null,
    });
  }

  try {
    const decoded = verifyRefreshToken(refresh_token);
    if (!decoded) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = createAccessToken(decoded.userId);

    res.json({
      success: 1,
      message: "Access token refreshed successfully",
      data: {
        access_token: newAccessToken,
      },
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({
      success: 0,
      message: "Invalid refresh token",
      data: null,
    });
  }
};

// Add this to your routes:
