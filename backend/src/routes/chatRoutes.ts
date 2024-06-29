import express from "express";
import {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  deleteMessage,
  markMessagesAsSeen,
} from "../controllers/chatController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createChat);
router.get("/", auth, getUserChats);
router.get("/:chatId", auth, getChatMessages);
router.post("/:chatId/messages", auth, sendMessage);
router.delete("/:chatId/messages/:messageId", auth, deleteMessage);
router.post("/:chatId/seen", auth, markMessagesAsSeen);

export default router;
