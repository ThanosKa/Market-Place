import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Text,
} from "react-native";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { ChatMessage, PaginatedChatDetails } from "../../interfaces/chat";
import { colors } from "../../colors/colors";
import { t } from "i18next";
import {
  setupNavigationOptions,
  sendMessageAndUpdateUI,
  renderMessageAvatar,
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

  React.useEffect(() => {
    if (data?.pages[0]) {
      setupNavigationOptions(navigation, data.pages[0].otherParticipant);
    }
  }, [data, navigation]);

  const handleSendMessage = useCallback(
    async (text: string, imageUris: string[]) => {
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
      onSuccess: () => {
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

  const renderListEmptyComponent = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={50}
          color={colors.secondary}
        />
        <Text style={styles.emptyText}>{t("start-chatting")}</Text>
      </View>
    );
  }, []);

  const renderSeparator = useCallback(({ type }: { type: string }) => {
    return (
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>{t(type)}</Text>
        <View style={styles.separatorLine} />
      </View>
    );
  }, []);
  const processedMessages = useMemo(() => {
    if (!flatListContent.length) return [];

    let hasShownNewestSeparator = false;
    let firstUnseenMessageIndex = -1;

    // Find the index of the first unseen message from the other user
    for (let i = flatListContent.length - 1; i >= 0; i--) {
      if (!flatListContent[i].isOwnMessage && !flatListContent[i].seen) {
        firstUnseenMessageIndex = i;
        break;
      }
    }

    return flatListContent.map((message, index) => {
      const showNewestSeparator =
        !hasShownNewestSeparator &&
        index === firstUnseenMessageIndex &&
        !message.isOwnMessage &&
        !message.seen;

      if (showNewestSeparator) {
        hasShownNewestSeparator = true;
      }

      return { ...message, showNewestSeparator };
    });
  }, [flatListContent]);
  const renderMessage = useCallback(
    ({
      item,
      index,
    }: {
      item: ChatMessage & { showNewestSeparator: boolean };
      index: number;
    }) => {
      const showAvatar =
        !item.isOwnMessage &&
        (index === 0 || processedMessages[index - 1].isOwnMessage);
      const isSending = sendingMessages.has(item._id);
      const isLastMessage = index === 0;

      return (
        <>
          <MessageBubble
            message={item}
            showAvatar={showAvatar}
            isSending={isSending}
            isLastMessage={isLastMessage}
            onDeleteMessage={handleDeleteMessage}
            senderId={item.sender?._id}
            renderAvatar={() => renderMessageAvatar(item.sender, showAvatar)}
          />
          {item.showNewestSeparator &&
            renderSeparator({ type: "newest-messages" })}
        </>
      );
    },
    [processedMessages, sendingMessages, handleDeleteMessage, renderSeparator]
  );

  const renderFooter = useCallback(() => {
    if (!data) return null;

    const lastPage = data.pages[data.pages.length - 1];
    const { totalMessages, currentPage, totalPages, hasNextPage } = lastPage;

    if (totalMessages === 0) {
      return null;
    }

    if (isFetchingNextPage) {
      return (
        <>
          {renderSeparator({ type: "older-messages" })}
          <ActivityIndicator size="small" color={colors.secondary} />
          {/* <Text style={styles.olderMessagesText}>
            {t("loading-older-messages")}
          </Text> */}
        </>
      );
    }

    if (hasNextPage) {
      return renderSeparator({ type: "older-messages" });
    }

    if (currentPage === totalPages && totalPages > 1) {
      return renderSeparator({ type: "no-older-messages" });
    }

    return null;
  }, [data, isFetchingNextPage, renderSeparator]);

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

  const totalMessages = data?.pages[0]?.totalMessages || 0;

  return (
    <View style={styles.container}>
      {totalMessages === 0 ? (
        renderListEmptyComponent()
      ) : (
        <FlatList
          ref={flatListRef}
          data={processedMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          inverted
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}
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
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.secondary,
  },
  separatorText: {
    paddingHorizontal: 10,
    color: colors.secondary,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: colors.secondary,
    marginTop: 10,
  },
  olderMessagesText: {
    textAlign: "center",
    padding: 10,
    color: colors.secondary,
  },
});

export default ChatScreen;
