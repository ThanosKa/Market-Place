import express from "express";
import { auth } from "../middleware/auth";
import multer from "multer";
import path from "path";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post("/", auth, upload.array("images", 5), createProduct);
router.get("/", getProducts);
router.get("/:productId", getProductById);
router.put("/:productId", auth, upload.array("images", 5), updateProduct);
router.delete("/:productId", auth, deleteProduct);

export default router;
