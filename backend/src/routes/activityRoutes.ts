import express from "express";
import { auth } from "../middleware/auth";
import {
  createReviewPromptActivity,
  deleteActivity,
  getActivities,
  markActivityAsRead,
  markAllActivitiesAsRead,
} from "../controllers/activityController";

const router = express.Router();

router.get("/", auth, getActivities);
router.put("/:id/read", auth, markActivityAsRead);
router.put("/mark-all-read", auth, markAllActivitiesAsRead);
router.delete("/:id", auth, deleteActivity);
router.post("/review-prompt", auth, createReviewPromptActivity);

export default router;
