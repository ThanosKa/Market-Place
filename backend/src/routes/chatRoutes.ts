import express from "express";
import {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  deleteChat,
  markMessagesAsSeen,
} from "../controllers/chatController";
import { auth } from "../middleware/auth";
import { upload } from "../utils/uploadUtil";

const router = express.Router();

router.post("/", auth, createChat);
router.get("/", auth, getUserChats);
router.get("/:chatId/messages", auth, getChatMessages);
router.post("/:chatId/messages", auth, upload("uploads/", 5), sendMessage);
router.put(
  "/:chatId/messages/:messageId",
  auth,
  upload("uploads/", 5),
  editMessage
);
router.delete("/:chatId/messages/:messageId", auth, deleteMessage);
router.delete("/:chatId", auth, deleteChat);
router.post("/:chatId/seen", auth, markMessagesAsSeen);

export default router;
