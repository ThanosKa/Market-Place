// routes/activityRoutes.ts

import express from "express";
import { auth } from "../middleware/auth";
import {
  getActivities,
  markActivityAsRead,
} from "../controllers/activityController";

const router = express.Router();

router.get("/", auth, getActivities);
router.put("/:id/read", auth, markActivityAsRead);

export default router;
