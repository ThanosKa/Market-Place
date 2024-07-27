import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  deleteMessage,
  getChatMessages,
  sendMessage,
} from "../../services/chat";
import { ChatMessage } from "../../interfaces/chat";
import { FlatList } from "react-native";

export const useChatMessages = (chatId: string) => {
  return useQuery(["chatMessages", chatId], () => getChatMessages(chatId), {
    refetchInterval: 5000,
  });
};

export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient();
  return useMutation((content: string) => sendMessage(chatId, content, []), {
    onSuccess: () => {
      queryClient.invalidateQueries(["chatMessages", chatId]);
    },
  });
};

export const scrollToBottom = (
  flatListRef: React.RefObject<FlatList<ChatMessage>>,
  messagesLength: number,
  animated = true
) => {
  if (flatListRef.current && messagesLength) {
    flatListRef.current.scrollToOffset({
      offset: Number.MAX_SAFE_INTEGER,
      animated,
    });
  }
};
export const formatMessageTime = (
  timestamp: Date | string | number
): string => {
  if (timestamp === undefined || timestamp === null) {
    return "";
  }

  let date: Date;

  if (typeof timestamp === "string") {
    date = new Date(timestamp);
  } else if (typeof timestamp === "number") {
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return "";
  }

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const useDeleteMessage = (chatId: string) => {
  const queryClient = useQueryClient();
  return useMutation((messageId: string) => deleteMessage(chatId, messageId), {
    onSuccess: () => {
      queryClient.invalidateQueries(["chatMessages", chatId]);
    },
  });
};
