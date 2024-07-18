import express from "express";
import {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  deleteMessage,
  markMessagesAsSeen,
  editMessage,
} from "../controllers/chatController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createChat);
router.get("/", auth, getUserChats);
router.get("/:chatId", auth, getChatMessages);
router.post("/:chatId/messages", auth, sendMessage);
router.put("/:chatId/messages/:messageId", auth, editMessage);
router.delete("/:chatId/messages/:messageId", auth, deleteMessage);
router.post("/:chatId/seen", auth, markMessagesAsSeen);

export default router;
