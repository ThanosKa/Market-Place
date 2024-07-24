import express from "express";
import { auth } from "../middleware/auth";
import { upload } from "../utils/uploadUtil";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getUserProducts,
  getUserByIdProducts,
} from "../controllers/productController";

const router = express.Router();

router.post("/", auth, upload("uploads/", 5), createProduct);
router.get("/", getProducts);
router.get("/user", auth, getUserProducts); // New route for user's products
router.get("/:productId", getProductById);
router.put("/:productId", auth, upload("uploads/", 5), updateProduct);
router.delete("/:productId", auth, deleteProduct);
router.get("/user", auth, getUserProducts);
router.get("/user/:id", auth, getUserByIdProducts);
export default router;
