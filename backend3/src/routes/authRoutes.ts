// src/routes/authRoutes.ts
import express from "express";
import { register, login } from "../controllers/authController";

console.log("AuthRoutes loaded - Version 1"); // Add this line

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
