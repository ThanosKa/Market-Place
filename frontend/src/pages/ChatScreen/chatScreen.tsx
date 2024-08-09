// ChatScreen.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Text,
} from "react-native";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "react-query";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { ChatMessage, PaginatedChatDetails } from "../../interfaces/chat";
import { colors } from "../../colors/colors";
import { t } from "i18next";
import {
  updateQueryDataWithNewMessage,
  updateQueryDataWithServerResponse,
  setupNavigationOptions,
  sendMessageAndUpdateUI,
  renderMessageAvatar,
  renderFooter,
} from "./chatUtils";
import {
  getChatMessages,
  sendMessage,
  deleteMessage,
} from "../../services/chat";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

type ChatScreenRouteProp = RouteProp<MainStackParamList, "Chat">;
type ChatScreenNavigationProp = StackNavigationProp<MainStackParamList, "Chat">;

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { chatId } = route.params;
  const [message, setMessage] = useState("");
  const [sendingMessages, setSendingMessages] = useState<Set<string>>(
    new Set()
  );
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollButtonOpacity = useRef(new Animated.Value(0)).current;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<PaginatedChatDetails>(
      ["chatMessages", chatId],
      ({ pageParam = 1 }) => getChatMessages(chatId || "", pageParam),
      {
        getNextPageParam: (lastPage) =>
          lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
        retry: false,
      }
    );

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, []);

  const handleScroll = useCallback(
    (event: any) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const shouldShow = currentOffset > 100;

      if (shouldShow !== showScrollButton) {
        setShowScrollButton(shouldShow);
        Animated.timing(scrollButtonOpacity, {
          toValue: shouldShow ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
    [showScrollButton, scrollButtonOpacity]
  );

  const sendMessageMutation = useMutation(
    (newMessage: { content: string; images: string[]; tempId: string }) =>
      sendMessage(chatId || "", newMessage.content, newMessage.images),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["chatMessages", chatId]);
        setSendingMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(variables.tempId);
          return newSet;
        });
      },
    }
  );

  useEffect(() => {
    if (data?.pages[0]) {
      setupNavigationOptions(navigation, data.pages[0].otherParticipant);
    }
  }, [data, navigation]);

  const handleSendMessage = useCallback(
    async (text: string, imageUris: string[]) => {
      console.log("Received image URIs in ChatScreen:", imageUris);
      await sendMessageAndUpdateUI(
        queryClient,
        chatId || "",
        text,
        imageUris,
        sendMessageMutation,
        setSendingMessages,
        scrollToBottom
      );
    },
    [chatId, queryClient, sendMessageMutation, scrollToBottom]
  );

  const flatListContent = data?.pages.flatMap((page) => page.messages) ?? [];

  const deleteMessageMutation = useMutation(
    (messageId: string) => deleteMessage(chatId || "", messageId),
    {
      onMutate: async (messageId) => {
        await queryClient.cancelQueries(["chatMessages", chatId]);
        const previousMessages = queryClient.getQueryData<
          InfiniteData<PaginatedChatDetails>
        >(["chatMessages", chatId]);
        queryClient.setQueryData<
          InfiniteData<PaginatedChatDetails> | undefined
        >(["chatMessages", chatId], (old) => {
          if (!old) return undefined;
          return {
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.filter((msg) => msg._id !== messageId),
            })),
            pageParams: old.pageParams,
          };
        });
        return { previousMessages };
      },
      onError: (err, messageId, context) => {
        queryClient.setQueryData(
          ["chatMessages", chatId],
          context?.previousMessages
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(["chatMessages", chatId]);
      },
    }
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      deleteMessageMutation.mutate(messageId);
    },
    [deleteMessageMutation]
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const showAvatar =
        !item.isOwnMessage &&
        (index === 0 || flatListContent[index - 1].isOwnMessage);
      const isSending = sendingMessages.has(item._id);
      const isLastMessage = index === 0;

      return (
        <MessageBubble
          message={item}
          showAvatar={showAvatar}
          isSending={isSending}
          isLastMessage={isLastMessage}
          onDeleteMessage={handleDeleteMessage}
          senderId={item.sender?._id}
          renderAvatar={() => renderMessageAvatar(item.sender, showAvatar)}
        />
      );
    },
    [flatListContent, sendingMessages, handleDeleteMessage]
  );

  const loadMoreMessages = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.noMessagesContainer}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={50}
            color={colors.secondary}
          />
          <Text style={styles.noMessagesText}>{t("no-messages-yet")}</Text>
        </View>
        <ChatInput
          value={message}
          onChangeText={(text: string) => setMessage(text)}
          handleSendMessage={handleSendMessage}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={flatListContent}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        inverted
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() =>
          renderFooter(isFetchingNextPage, hasNextPage)
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      <Animated.View
        style={[styles.scrollButtonContainer, { opacity: scrollButtonOpacity }]}
      >
        <TouchableOpacity
          style={styles.scrollButton}
          onPress={scrollToBottom}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="keyboard-arrow-down"
            size={40}
            color={colors.primary}
          />
        </TouchableOpacity>
      </Animated.View>
      <ChatInput
        value={message}
        onChangeText={(text: string) => setMessage(text)}
        handleSendMessage={handleSendMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
  },
  olderMessagesText: {
    textAlign: "center",
    padding: 10,
    color: colors.secondary,
  },
  scrollButtonContainer: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  scrollButton: {
    backgroundColor: "white",
    borderRadius: 25,
    width: 40,
    height: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMessagesText: {
    fontSize: 18,
    color: colors.secondary,
    fontStyle: "italic",
    marginTop: 10,
  },
});

export default ChatScreen;
