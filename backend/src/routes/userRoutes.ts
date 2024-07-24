import express from "express";
import { auth } from "../middleware/auth";
import { uploadSingle } from "../utils/uploadUtil";
import {
  getAllUsers,
  getUserById,
  editUser,
  deleteUser,
  getLoggedInUser,
  getUserDetails, // Add this new import
} from "../controllers/userController";

const router = express.Router();

router.get("/", auth, getAllUsers);
router.get("/me", auth, getLoggedInUser);
router.get("/details", auth, getUserDetails); // Add this new route
router.get("/:id", auth, getUserById);

router.put("/", auth, uploadSingle("uploads/"), editUser);
router.delete("/", auth, deleteUser);

export default router;
