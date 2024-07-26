import { useQuery, useMutation, useQueryClient } from "react-query";
import { getChatMessages, sendMessage } from "../../services/chat";
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
