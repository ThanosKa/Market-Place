// chatRoutes.ts
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
import { uploadChatImages } from "../utils/uploadUtil";

const router = express.Router();

router.post("/", auth, createChat);
router.get("/", auth, getUserChats);
router.get("/:chatId/messages", auth, getChatMessages);
router.post("/:chatId/messages", auth, uploadChatImages, sendMessage);
router.put("/:chatId/messages/:messageId", auth, uploadChatImages, editMessage);
router.delete("/:chatId/messages/:messageId", auth, deleteMessage);
router.delete("/:chatId", auth, deleteChat);
router.post("/:chatId/seen", auth, markMessagesAsSeen);

export default router;
