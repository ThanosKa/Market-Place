import express from "express";
import {
  register,
  forgotPassword,
  initiateLogin,
  exchangeToken,
  login,
} from "../controllers/authController";
import { refreshAccessToken } from "../controllers/refreshToken";

const router = express.Router();

router.post("/register", register);
// router.post("/login", login);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/initiate-login", initiateLogin);
router.post("/exchange-token", exchangeToken);
router.post("/refresh-token", refreshAccessToken);

export default router;
