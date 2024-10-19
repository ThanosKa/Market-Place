import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const authCodes = new Map();

export const createAuthorizationCode = (userId: string): string => {
  const code = uuidv4();
  authCodes.set(code, { userId, createdAt: Date.now() });
  return code;
};

export const verifyAuthorizationCode = (code: string): string | null => {
  const authCodeData = authCodes.get(code);
  if (!authCodeData) return null;

  const { userId, createdAt } = authCodeData;
  const now = Date.now();

  // Authorization codes expire after 10 minutes
  if (now - createdAt > 10 * 60 * 1000) {
    authCodes.delete(code);
    return null;
  }

  authCodes.delete(code);
  return userId;
};

export const createAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "1h",
  });
};

export const createRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token: string): any => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    // console.log("Decoded token:", decoded); // Add this line for debugging
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error); // Add this line for debugging
    return null;
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
  } catch (error) {
    return null;
  }
};
