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
import { ensureChatParticipant } from "../middleware/chat";

const router = express.Router();

router.post("/", auth, createChat);
router.get("/", auth, getUserChats);
router.get("/:chatId/messages", auth, ensureChatParticipant, getChatMessages);
router.post(
  "/:chatId/messages",
  auth,
  ensureChatParticipant,
  uploadChatImages,
  sendMessage
);
router.put(
  "/:chatId/messages/:messageId",
  auth,
  ensureChatParticipant,
  uploadChatImages,
  editMessage
);
router.delete(
  "/:chatId/messages/:messageId",
  auth,
  ensureChatParticipant,
  deleteMessage
);
router.delete("/:chatId", auth, ensureChatParticipant, deleteChat);
router.post("/:chatId/seen", auth, ensureChatParticipant, markMessagesAsSeen);

export default router;
