import express from "express";
import { getAllUsers, getUserById } from "../controllers/userController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.get("/", auth, getAllUsers);
router.get("/:id", auth, getUserById);

export default router;
