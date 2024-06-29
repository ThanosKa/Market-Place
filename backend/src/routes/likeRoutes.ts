import express from "express";
import {
  toggleLikeProduct,
  toggleLikeUser,
} from "../controllers/likeController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/product/:productId", auth, toggleLikeProduct);
router.post("/user/:likedUserId", auth, toggleLikeUser);

export default router;
