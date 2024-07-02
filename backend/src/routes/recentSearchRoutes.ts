import express from "express";
import {
  addRecentSearch,
  getRecentSearches,
  deleteRecentSearch,
  deleteAllRecentSearches,
} from "../controllers/recentSearchController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, addRecentSearch);
router.get("/", auth, getRecentSearches);
router.delete("/all", auth, deleteAllRecentSearches);
router.delete("/:id", auth, deleteRecentSearch);

export default router;
