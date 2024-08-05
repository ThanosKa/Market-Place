import {
  Chat,
  ChatDetails,
  ChatMessage,
  PaginatedChatDetails,
} from "../interfaces/chat";
import axiosInstance from "./axiosConfig";

export const createChat = async (participantId: string): Promise<Chat> => {
  try {
    const response = await axiosInstance.post<{
      success: number;
      message: string;
      data: { chat: Chat };
    }>("/chats", { participantId });
    return response.data.data.chat;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const getUserChats = async (): Promise<Chat[]> => {
  try {
    const response = await axiosInstance.get<{
      success: number;
      message: string;
      data: { chats: Chat[] };
    }>("/chats");
    return response.data.data.chats;
  } catch (error) {
    console.error("Error fetching user chats:", error);
    throw error;
  }
};
export const getChatMessages = async (
  chatId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedChatDetails> => {
  try {
    const response = await axiosInstance.get<{
      success: number;
      message: string;
      data: PaginatedChatDetails;
    }>(`/chats/${chatId}/messages`, {
      params: {
        page,
        limit,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
};
export const markMessagesAsSeen = async (chatId: string): Promise<void> => {
  try {
    await axiosInstance.post(`/chats/${chatId}/seen`);
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    throw error;
  }
};
export const sendMessage = async (
  chatId: string,
  content: string,
  images: string[]
): Promise<ChatMessage> => {
  try {
    const formData = new FormData();
    formData.append("content", content);

    images.forEach((image, index) => {
      formData.append("images", {
        uri: image,
        type: "image/jpeg",
        name: `image_${index}.jpg`,
      } as any);
    });

    const response = await axiosInstance.post<{
      success: number;
      message: string;
      data: { message: ChatMessage };
    }>(`/chats/${chatId}/messages`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data.message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
export const editMessage = async (
  chatId: string,
  messageId: string,
  content: string,
  images?: File[]
): Promise<ChatMessage> => {
  try {
    const formData = new FormData();
    formData.append("content", content);
    if (images) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await axiosInstance.put<{
      success: number;
      message: string;
      data: { message: ChatMessage };
    }>(`/chats/${chatId}/messages/${messageId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data.message;
  } catch (error) {
    console.error("Error editing message:", error);
    throw error;
  }
};

export const deleteMessage = async (
  chatId: string,
  messageId: string
): Promise<void> => {
  try {
    await axiosInstance.delete(`/chats/${chatId}/messages/${messageId}`);
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/chats/${chatId}`);
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
};
