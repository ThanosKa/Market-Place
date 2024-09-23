import { Request, Response } from "express";
import mongoose from "mongoose";
import Chat, { IMessage } from "../models/Chat";
import User from "../models/User";
import { createActivity } from "./activityController";
import { formatChatMessage, formatUser } from "../utils/formatImagesUrl";
export const createChat = async (req: Request, res: Response) => {
  try {
    const { participantId } = req.body;
    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const participantObjectId = new mongoose.Types.ObjectId(participantId);

    // Check for existing chat, including soft-deleted ones
    const existingChat = await Chat.findOne({
      participants: { $all: [userId, participantObjectId] },
    });

    if (existingChat) {
      // If the chat exists but was deleted by the current user, restore it
      const deletedForCurrentUser = existingChat.deletedFor.find(
        (deletion) => deletion.user.toString() === userId.toString()
      );

      if (deletedForCurrentUser) {
        // Remove the deletion entry for the current user
        await Chat.findOneAndUpdate(
          { _id: existingChat._id },
          { $pull: { deletedFor: { user: userId } } },
          { new: true }
        );

        return res.status(200).json({
          success: 1,
          message: "Chat restored successfully",
          data: { chat: existingChat },
        });
      }

      // If the chat wasn't deleted, just return it
      return res.status(200).json({
        success: 1,
        message: "Chat already exists",
        data: { chat: existingChat },
      });
    }

    // If no existing chat, create a new one
    const newChat = new Chat({
      participants: [userId, participantObjectId],
      messages: [],
      deletedFor: [],
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
    const userId = new mongoose.Types.ObjectId((req as any).userId);

    const chats = await Chat.aggregate([
      {
        $match: {
          participants: userId,
          deletedFor: { $not: { $elemMatch: { user: userId } } },
        },
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$messages", -1] },
        },
      },
      { $sort: { "lastMessage.timestamp": -1 } },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participantDetails",
        },
      },
      {
        $addFields: {
          otherParticipant: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$participantDetails",
                  as: "participant",
                  cond: { $ne: ["$$participant._id", userId] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          otherParticipant: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            profilePicture: 1,
          },
          lastMessage: {
            _id: 1,
            content: 1,
            images: 1,
            sender: 1,
            timestamp: 1,
            seen: 1,
            isOwnMessage: { $eq: ["$lastMessage.sender", userId] },
          },
          unreadCount: {
            $size: {
              $filter: {
                input: "$messages",
                as: "message",
                cond: {
                  $and: [
                    { $ne: ["$$message.sender", userId] },
                    { $eq: ["$$message.seen", false] },
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    // Process the chats to format the last message
    const formattedChats = chats.map((chat) => ({
      ...chat,
      otherParticipant: formatUser(chat.otherParticipant),
      lastMessage: chat.lastMessage
        ? formatChatMessage(chat.lastMessage)
        : null,
    }));

    res.json({
      success: 1,
      message: "Chats retrieved successfully",
      data: { chats: formattedChats },
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
    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const chat = await Chat.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(chatId),
          participants: userId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participantDetails",
        },
      },
      {
        $addFields: {
          otherParticipant: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$participantDetails",
                  as: "participant",
                  cond: { $ne: ["$$participant._id", userId] },
                },
              },
              0,
            ],
          },
          deletionInfo: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$deletedFor",
                  as: "deletion",
                  cond: { $eq: ["$$deletion.user", userId] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          filteredMessages: {
            $cond: {
              if: { $ifNull: ["$deletionInfo.messagesDeletedAt", false] },
              then: {
                $filter: {
                  input: "$messages",
                  as: "message",
                  cond: {
                    $gt: [
                      "$$message.timestamp",
                      "$deletionInfo.messagesDeletedAt",
                    ],
                  },
                },
              },
              else: "$messages",
            },
          },
        },
      },
      {
        $addFields: {
          paginatedMessages: {
            $slice: [{ $reverseArray: "$filteredMessages" }, skip, limit],
          },
        },
      },
      {
        $addFields: {
          messages: {
            $map: {
              input: "$paginatedMessages",
              as: "message",
              in: {
                _id: "$$message._id",
                content: "$$message.content",
                images: "$$message.images",
                timestamp: "$$message.timestamp",
                seen: "$$message.seen",
                edited: "$$message.edited",
                isOwnMessage: { $eq: ["$$message.sender", userId] },
                sender: {
                  $cond: [
                    { $eq: ["$$message.sender", userId] },
                    null,
                    {
                      _id: "$otherParticipant._id",
                      firstName: "$otherParticipant.firstName",
                      lastName: "$otherParticipant.lastName",
                      profilePicture: "$otherParticipant.profilePicture",
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          otherParticipant: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            profilePicture: 1,
          },
          messages: 1,
          totalMessages: { $size: "$filteredMessages" },
        },
      },
    ]);

    if (!chat || chat.length === 0) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found or you don't have access to it",
        data: null,
      });
    }

    // Mark unseen messages as seen
    await Chat.updateMany(
      {
        _id: new mongoose.Types.ObjectId(chatId),
        "messages.sender": { $ne: userId },
        "messages.seen": false,
      },
      { $set: { "messages.$[elem].seen": true } },
      {
        arrayFilters: [{ "elem.sender": { $ne: userId }, "elem.seen": false }],
        multi: true,
      }
    );

    const totalMessages = chat[0].totalMessages;
    const totalPages = Math.ceil(totalMessages / limit);

    const formattedChat = {
      ...chat[0],
      otherParticipant: formatUser(chat[0].otherParticipant),
      messages: chat[0].messages.map(formatChatMessage),
    };

    res.json({
      success: 1,
      message: "Chat messages retrieved successfully",
      data: {
        ...formattedChat,
        currentPage: page,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
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
    const userId = new mongoose.Types.ObjectId((req as any).userId);

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: 0,
        message: "Invalid chat ID",
        data: null,
      });
    }

    // Check if the user is a participant in the chat
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

    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = (req.files as Express.Multer.File[]).map(
        (file) => `/uploads/${file.filename}`
      );
    }

    if (!content && images.length === 0) {
      return res.status(400).json({
        success: 0,
        message: "Message must contain either text content or images",
        data: null,
      });
    }

    const newMessage: IMessage = {
      _id: new mongoose.Types.ObjectId(),
      sender: userId,
      content: content || undefined,
      images,
      timestamp: new Date(),
      seen: false,
    };

    // Add the new message and update the chat
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        $push: { messages: newMessage },
        $set: { updatedAt: new Date() },
        $pull: { deletedFor: { user: { $ne: userId } } },
      },
      { new: true }
    );

    if (!updatedChat) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found",
        data: null,
      });
    }

    const populatedMessage = await Chat.populate(newMessage, {
      path: "sender",
      select: "firstName lastName email username",
    });

    const formattedMessage = formatChatMessage(populatedMessage);

    res.json({
      success: 1,
      message: "Message sent successfully",
      data: { message: formattedMessage },
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
export const deleteChat = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    const userId = new mongoose.Types.ObjectId((req as any).userId);

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: 0,
        message: "Chat not found or you're not a participant",
        data: null,
      });
    }

    const currentDate = new Date();

    // Update the deletedFor array
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        $set: {
          deletedFor: [
            ...chat.deletedFor.filter((item) => !item.user.equals(userId)),
            { user: userId, deletedAt: currentDate },
          ],
        },
      },
      { new: true }
    );

    if (!updatedChat) {
      return res.status(500).json({
        success: 0,
        message: "Failed to update chat",
        data: null,
      });
    }

    // Check if all participants have deleted the chat
    if (updatedChat.deletedFor.length === updatedChat.participants.length) {
      // All participants have deleted the chat, so remove it from the database
      await Chat.findByIdAndDelete(chatId);

      return res.json({
        success: 1,
        message: "Chat completely removed from the database",
        data: null,
      });
    }

    res.json({
      success: 1,
      message: "Chat deleted successfully for the user",
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
    const messageTooOld =
      new Date().getTime() - message.timestamp.getTime() > 24 * 60 * 60 * 1000;
    if (messageTooOld) {
      return res.status(403).json({
        success: 0,
        message: "Message is too old to edit",
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

    // Update content if provided
    if (content) {
      message.content = content;
    }

    // Handle image updates
    if (req.files && Array.isArray(req.files)) {
      const newImages = (req.files as Express.Multer.File[]).map(
        (file) => `/uploads/${file.filename}`
      );

      // Replace existing images or add new ones
      message.images = newImages;
    }

    message.edited = true;
    await chat.save();

    const formattedMessage = formatChatMessage(message);

    res.json({
      success: 1,
      message: "Message edited successfully",
      data: { message: formattedMessage },
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

export const getUnreadChatsCount = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);

    const unreadChatsCount = await Chat.aggregate([
      {
        $match: {
          participants: userId,
          deletedFor: { $not: { $elemMatch: { user: userId } } },
        },
      },
      {
        $addFields: {
          hasUnreadMessages: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$messages",
                    as: "message",
                    cond: {
                      $and: [
                        { $ne: ["$$message.sender", userId] },
                        { $eq: ["$$message.seen", false] },
                      ],
                    },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $match: {
          hasUnreadMessages: true,
        },
      },
      {
        $count: "unreadChatsCount",
      },
    ]);

    const count =
      unreadChatsCount.length > 0 ? unreadChatsCount[0].unreadChatsCount : 0;

    res.json({
      success: 1,
      message: "Unread chats count retrieved successfully",
      data: { unreadChatsCount: count },
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
