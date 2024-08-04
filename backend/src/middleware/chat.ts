// middleware/chat.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Chat from "../models/Chat";

export const ensureChatParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const chatId = req.params.chatId;
    const userId = new mongoose.Types.ObjectId((req as any).userId);

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(403).json({
        success: 0,
        message: "Access denied. You are not a participant in this chat.",
        data: null,
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};
