// ChatScreen.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Text,
  ActivityIndicator,
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
import { ChatMessage, PaginatedChatDetails, User } from "../../interfaces/chat";
import { BASE_URL } from "../../services/axiosConfig";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { colors } from "../../colors/colors";
import { t } from "i18next";
import {
  updateQueryDataWithNewMessage,
  updateQueryDataWithServerResponse,
} from "./chatUtils";
import {
  getChatMessages,
  sendMessage,
  markMessagesAsSeen,
  deleteMessage,
} from "../../services/chat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

interface NewMessage {
  content: string;
  images: File[];
  tempId: string;
}

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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery<PaginatedChatDetails>(
    ["chatMessages", chatId],
    ({ pageParam = 1 }) => getChatMessages(chatId, pageParam),
    {
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
      onSuccess: (data) => {
        if (data.pages[0].currentPage === 1) {
          markMessagesAsSeenMutation.mutate();
        }
      },
    }
  );

  const sendMessageMutation = useMutation<ChatMessage, Error, NewMessage>(
    (newMessage) => sendMessage(chatId, newMessage.content, newMessage.images),
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

  const markMessagesAsSeenMutation = useMutation(() =>
    markMessagesAsSeen(chatId)
  );

  useEffect(() => {
    if (data?.pages[0]) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.headerTitle}>
            {data.pages[0].otherParticipant.profilePicture ? (
              <Image
                source={{
                  uri: `${BASE_URL}/${data.pages[0].otherParticipant.profilePicture}`,
                }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={styles.headerAvatar}>
                <UndefProfPicture size={36} iconSize={18} />
              </View>
            )}
            <Text style={styles.headerName}>
              {data.pages[0].otherParticipant.firstName}{" "}
              {data.pages[0].otherParticipant.lastName}
            </Text>
          </View>
        ),
      });
    }
  }, [data, navigation]);

  const handleSendMessage = useCallback(
    async (text: string, imageUris: string[]) => {
      const tempId = Date.now().toString();
      const newMessage: ChatMessage = {
        _id: tempId,
        content: text,
        timestamp: new Date(),
        isOwnMessage: true,
        seen: false,
        sender: null,
        images: imageUris,
      };

      updateQueryDataWithNewMessage(queryClient, chatId, newMessage);
      setSendingMessages((prev) => new Set(prev).add(tempId));

      const imageFiles: File[] = await Promise.all(
        imageUris.map(async (uri, index) => {
          const response = await fetch(uri);
          const blob = await response.blob();
          const fileName = `image-${Date.now()}-${index}.jpg`;
          return new File([blob], fileName, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
        })
      );

      sendMessageMutation.mutate(
        { content: text, images: imageFiles, tempId },
        {
          onSuccess: (data) => {
            console.log("Message sent successfully:", data);
            updateQueryDataWithServerResponse(
              queryClient,
              chatId,
              data,
              tempId,
              imageUris
            );
            setSendingMessages((prev) => {
              const newSet = new Set(prev);
              newSet.delete(tempId);
              return newSet;
            });
          },
          onError: (error) => {
            console.error("Error sending message:", error);
          },
        }
      );
    },
    [sendMessageMutation, queryClient, chatId]
  );

  const flatListContent = data?.pages.flatMap((page) => page.messages) ?? [];

  const deleteMessageMutation = useMutation(
    (messageId: string) => deleteMessage(chatId, messageId),
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
          renderAvatar={() =>
            item.sender && showAvatar ? (
              item.sender.profilePicture ? (
                <Image
                  source={{
                    uri: `${BASE_URL}/${item.sender.profilePicture}`,
                  }}
                  style={styles.messageAvatar}
                />
              ) : (
                <View style={styles.messageAvatar}>
                  <UndefProfPicture size={28} iconSize={14} />
                </View>
              )
            ) : (
              <View style={styles.messageAvatar} />
            )
          }
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

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return <ActivityIndicator size="small" color={colors.secondary} />;
    }
    if (hasNextPage) {
      return (
        <Text style={styles.olderMessagesText}>{t("older-messages")}</Text>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.secondary} />
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
        ListFooterComponent={renderFooter}
      />
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
});

export default ChatScreen;
