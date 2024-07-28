import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  deleteMessage,
  getChatMessages,
  sendMessage,
} from "../../services/chat";
import { ChatMessage, PaginatedChatDetails } from "../../interfaces/chat";
import { FlatList } from "react-native";

import { useInfiniteQuery } from "react-query";

export const useChatMessages = (chatId: string) => {
  return useInfiniteQuery<PaginatedChatDetails, Error>(
    ["chatMessages", chatId],
    ({ pageParam = 1 }) => getChatMessages(chatId, pageParam),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.hasNextPage) {
          return lastPage.currentPage + 1;
        }
        return undefined;
      },
      refetchInterval: 5000,
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );
};
export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient();
  return useMutation((content: string) => sendMessage(chatId, content, []), {
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries(["chatMessages", chatId]);

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData([
        "chatMessages",
        chatId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["chatMessages", chatId], (old: any) => {
        const newMessageObject = {
          _id: Date.now().toString(), // Temporary ID
          content: newMessage,
          isOwnMessage: true,
          createdAt: new Date().toISOString(),
        };
        return {
          ...old,
          messages: [...(old?.messages || []), newMessageObject],
        };
      });

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["chatMessages", chatId],
        context?.previousMessages
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
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
