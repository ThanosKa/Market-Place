import express from "express";
import {
  toggleLikeProduct,
  toggleLikeUser,
  getLikedProducts,
  getLikedProfiles,
} from "../controllers/likeController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/product/:productId", auth, toggleLikeProduct);
router.post("/user/:likedUserId", auth, toggleLikeUser);

// New GET routes
router.get("/products", auth, getLikedProducts);
router.get("/profiles", auth, getLikedProfiles);

export default router;
