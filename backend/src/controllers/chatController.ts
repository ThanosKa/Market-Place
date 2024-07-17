import { Request, Response } from "express";
import mongoose from "mongoose";
import Chat, { IMessage } from "../models/Chat";
import User from "../models/User";
import { createActivity } from "./activityController";

export const createChat = async (req: Request, res: Response) => {
  try {
    const { participantId } = req.body;
    const userId = (req as any).userId;

    const existingChat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (existingChat) {
      return res.status(400).json({
        success: 0,
        message: "Chat already exists",
        data: null,
      });
    }

    const newChat = new Chat({
      participants: [userId, participantId],
      messages: [],
    });

    await newChat.save();

    res.status(201).json({
      success: 1,
      message: "Chat created successfully",
      data: { chat: newChat },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};

export const getUserChats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "firstName lastName email")
      .sort({ updatedAt: -1 });

    res.json({
      success: 1,
      message: "Chats retrieved successfully",
      data: { chats },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    const userId = (req as any).userId;

    const chat = await Chat.findOne({ _id: chatId, participants: userId })
      .populate("participants", "firstName lastName email")
      .populate("messages.sender", "firstName lastName email");

    if (!chat) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found",
        data: null,
      });
    }

    // Mark unseen messages as seen
    chat.messages.forEach((message) => {
      if (message.sender.toString() !== userId && !message.seen) {
        message.seen = true;
      }
    });
    await chat.save();

    res.json({
      success: 1,
      message: "Chat messages retrieved successfully",
      data: { chat },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const chatId = req.params.chatId;
    const userId = (req as any).userId;

    const chat = await Chat.findOne({ _id: chatId, participants: userId });

    if (!chat) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found",
        data: null,
      });
    }

    const newMessage: IMessage = {
      _id: new mongoose.Types.ObjectId(),
      sender: new mongoose.Types.ObjectId(userId),
      content,
      timestamp: new Date(),
      seen: false,
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Populate the sender information
    const populatedMessage = await Chat.populate(newMessage, {
      path: "sender",
      select: "firstName lastName email username",
    });

    // Create an activity for the recipient
    const recipientId = chat.participants.find(
      (participantId) => participantId.toString() !== userId
    );
    if (recipientId) {
      await createActivity(
        recipientId.toString(),
        "message",
        userId,
        `New message: ${content.substring(0, 50)}${
          content.length > 50 ? "..." : ""
        }`,
        chatId.toString() // Adding chatId as an identifier
      );
    }

    res.json({
      success: 1,
      message: "Message sent successfully",
      data: { message: populatedMessage },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};
export const editMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, messageId } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    const chat = await Chat.findOne({ _id: chatId, participants: userId });

    if (!chat) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found",
        data: null,
      });
    }

    const message = chat.messages.find(
      (msg) => msg._id.toString() === messageId
    );

    if (!message) {
      return res.status(404).json({
        success: 0,
        message: "Message not found",
        data: null,
      });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: 0,
        message: "You are not authorized to edit this message",
        data: null,
      });
    }

    message.content = content;
    message.edited = true;
    await chat.save();

    res.json({
      success: 1,
      message: "Message edited successfully",
      data: { message },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = (req as any).userId;

    const chat = await Chat.findOne({ _id: chatId, participants: userId });

    if (!chat) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found",
        data: null,
      });
    }

    const messageIndex = chat.messages.findIndex(
      (msg) =>
        msg._id.toString() === messageId && msg.sender.toString() === userId
    );

    if (messageIndex === -1) {
      return res.status(404).json({
        success: 0,
        message: "Message not found or you are not authorized to delete it",
        data: null,
      });
    }

    chat.messages.splice(messageIndex, 1);
    await chat.save();

    res.json({
      success: 1,
      message: "Message deleted successfully",
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};

export const markMessagesAsSeen = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).userId;

    const chat = await Chat.findOne({ _id: chatId, participants: userId });

    if (!chat) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found",
        data: null,
      });
    }

    let updatedMessages = false;
    chat.messages.forEach((message) => {
      if (message.sender.toString() !== userId && !message.seen) {
        message.seen = true;
        updatedMessages = true;
      }
    });

    if (updatedMessages) {
      await chat.save();
    }

    res.json({
      success: 1,
      message: "Messages marked as seen",
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};
