import express from "express";
import { auth } from "../middleware/auth";
import { uploadSingle } from "../utils/uploadUtil";
import {
  getAllUsers,
  getAllUsersInfo, // Add this new import
  getUserById,
  editUser,
  deleteUser,
  getLoggedInUser,
  getUserDetails,
} from "../controllers/userController";

const router = express.Router();

router.get("/", auth, getAllUsers);
router.get("/info", auth, getAllUsersInfo); // Add this new route
router.get("/me", auth, getLoggedInUser);
router.get("/details", auth, getUserDetails);
router.get("/:id", auth, getUserById);

router.put("/", auth, uploadSingle("uploads/"), editUser);
router.delete("/", auth, deleteUser);

export default router;
