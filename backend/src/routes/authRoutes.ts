import express from "express";
import { clerkMiddleware } from '@clerk/express';
import {
  register,
  forgotPassword,
  initiateLogin,
  exchangeToken,
  login,
  handleClerkAuth,
} from "../controllers/authController";
import { refreshAccessToken } from "../controllers/refreshToken";

const router = express.Router();

// Apply clerk middleware only to clerk-auth route
router.post("/clerk-auth", clerkMiddleware(), handleClerkAuth);

// Other routes remain the same
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/initiate-login", initiateLogin);
router.post("/exchange-token", exchangeToken);
router.post("/refresh-token", refreshAccessToken);

export default router;
