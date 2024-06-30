import express from "express";
import { auth } from "../middleware/auth";
import { upload } from "../utils/uploadUtil";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

const router = express.Router();

router.post("/", auth, upload("uploads/productImages", 5), createProduct);
router.get("/", getProducts);
router.get("/:productId", getProductById);
router.put(
  "/:productId",
  auth,
  upload("uploads/productImages", 5),
  updateProduct
);
router.delete("/:productId", auth, deleteProduct);

export default router;
