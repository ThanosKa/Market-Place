import express from "express";
import { auth } from "../middleware/auth";
import { uploadSingle } from "../utils/uploadUtil";
import {
  getAllUsers,
  getUserById,
  editUser,
  deleteUser,
} from "../controllers/userController";

const router = express.Router();

router.get("/", auth, getAllUsers);
router.get("/:id", auth, getUserById);
router.put("/", auth, uploadSingle("uploads/profilePictures"), editUser);
router.delete("/", auth, deleteUser);

export default router;
