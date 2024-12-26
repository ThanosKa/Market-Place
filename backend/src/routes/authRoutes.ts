import express from "express";
import {
  register,
  forgotPassword,
  exchangeToken,
  login,
  resetPasswordByUsername,
} from "../controllers/authController";
import { refreshAccessToken } from "../controllers/refreshToken";

const router = express.Router();

router.post("/register", register);
// router.post("/login", login);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/exchange-token", exchangeToken);
router.post("/refresh-token", refreshAccessToken);
router.post("/reset-password-by-username", resetPasswordByUsername);

export default router;
