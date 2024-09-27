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
  getSoldUserProducts,
  getSoldUserByIdProducts,
  purchaseProduct,
  getPurchasedProducts,
  getPurchasedProductsByUserId,
  purchaseInPersonRequest,
  acceptPurchaseRequest,
  cancelPurchaseRequest,
} from "../controllers/productController";

const router = express.Router();

// Create a new product
router.post("/", auth, upload("uploads/", 5), createProduct);

// Get authenticated user's products (unsold)
router.get("/user", auth, getUserProducts);

// Get authenticated user's sold products
router.get("/user/sold", auth, getSoldUserProducts);

// Get authenticated user's purchased products
router.get("/user/purchased", auth, getPurchasedProducts);

// Get products of a specific user by ID (unsold)
router.get("/user/:id", auth, getUserByIdProducts);

// Get sold products of a specific user by ID
router.get("/user/:id/sold", auth, getSoldUserByIdProducts);

// Get purchased products of a specific user by ID
router.get("/user/:id/purchased", auth, getPurchasedProductsByUserId);

// Get all products (unsold)
router.get("/", getProducts);

// Get a specific product by ID (sold or unsold)
router.get("/:productId", getProductById);

// Update a product
router.put("/:productId", auth, upload("uploads/", 5), updateProduct);

// Delete a product
router.delete("/:productId", auth, deleteProduct);

// Purchase a product
router.post("/:productId/purchase", auth, purchaseProduct);

// New route: Request in-person purchase
router.post("/:productId/purchase-request", auth, purchaseInPersonRequest);

// New route: Accept purchase request
router.post("/:productId/accept-purchase-request", auth, acceptPurchaseRequest);
router.post("/:productId/cancel-purchase-request", auth, cancelPurchaseRequest);
export default router;
