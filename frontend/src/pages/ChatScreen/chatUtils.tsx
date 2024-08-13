// chatUtils.ts

import { InfiniteData, QueryClient } from "react-query";
import { ChatMessage, PaginatedChatDetails, User } from "../../interfaces/chat";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { BASE_URL } from "../../services/axiosConfig";
import { colors } from "../../colors/colors";
import React from "react";
import { t } from "i18next";

export const updateQueryDataWithNewMessage = (
  queryClient: QueryClient,
  chatId: string,
  newMessage: ChatMessage
) => {
  queryClient.setQueryData<InfiniteData<PaginatedChatDetails>>(
    ["chatMessages", chatId],
    (oldData): InfiniteData<PaginatedChatDetails> => {
      if (!oldData) {
        return {
          pages: [
            {
              _id: chatId,
              otherParticipant: {} as User,
              messages: [newMessage],
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          ],
          pageParams: [undefined],
        };
      }

      const newPages = [...oldData.pages];
      newPages[0] = {
        ...newPages[0],
        messages: [newMessage, ...newPages[0].messages],
      };
      return { ...oldData, pages: newPages };
    }
  );
};

export const updateQueryDataWithServerResponse = (
  queryClient: QueryClient,
  chatId: string,
  data: ChatMessage,
  tempId: string,
  imageUris: string[]
) => {
  queryClient.setQueryData<InfiniteData<PaginatedChatDetails>>(
    ["chatMessages", chatId],
    (oldData): InfiniteData<PaginatedChatDetails> => {
      if (!oldData) {
        return {
          pages: [
            {
              _id: chatId,
              otherParticipant: {} as User,
              messages: [{ ...data, isOwnMessage: true, images: imageUris }],
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          ],
          pageParams: [undefined],
        };
      }

      const newPages = [...oldData.pages];
      newPages[0] = {
        ...newPages[0],
        messages: newPages[0].messages.map((msg) =>
          msg._id === tempId
            ? { ...data, isOwnMessage: true, images: imageUris }
            : msg
        ),
      };
      return { ...oldData, pages: newPages };
    }
  );
};

export const setupNavigationOptions = (
  navigation: StackNavigationProp<MainStackParamList, "Chat">,
  otherParticipant: User
) => {
  navigation.setOptions({
    headerTitle: () => (
      <View style={styles.headerTitle}>
        {otherParticipant.profilePicture ? (
          <Image
            source={{
              uri: `${BASE_URL}/${otherParticipant.profilePicture}`,
            }}
            style={styles.headerAvatar}
          />
        ) : (
          <View style={styles.headerAvatar}>
            <UndefProfPicture size={36} iconSize={18} />
          </View>
        )}
        <Text style={styles.headerName}>
          {otherParticipant.firstName} {otherParticipant.lastName}
        </Text>
      </View>
    ),
  });
};

export const sendMessageAndUpdateUI = async (
  queryClient: QueryClient,
  chatId: string,
  text: string,
  imageUris: string[],
  sendMessageMutation: any,
  setSendingMessages: React.Dispatch<React.SetStateAction<Set<string>>>,
  scrollToBottom: () => void
) => {
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
    { content: text, images: imageUris, tempId },
    {
      onSuccess: (data: ChatMessage) => {
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
      onError: (error: Error) => {
        console.error("Error sending message:", error);
      },
    }
  );
  scrollToBottom();
};
export const renderMessageAvatar = (
  sender: User | null,
  showAvatar: boolean
) => {
  if (sender && showAvatar) {
    if (sender.profilePicture) {
      return (
        <Image
          source={{
            uri: `${BASE_URL}/${sender.profilePicture}`,
          }}
          style={styles.messageAvatar}
        />
      );
    } else {
      return (
        <View style={styles.messageAvatar}>
          <UndefProfPicture size={28} iconSize={14} />
        </View>
      );
    }
  }
  return <View style={styles.messageAvatar} />;
};

const styles = StyleSheet.create({
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

export const renderFooter = (
  isFetchingNextPage: boolean,
  hasNextPage: boolean | undefined
) => {
  if (isFetchingNextPage) {
    return (
      <>
        <ActivityIndicator size="small" color={colors.secondary} />
        <Text style={styles.olderMessagesText}>
          {t("loading-older-messages")}
        </Text>
      </>
    );
  }

  if (hasNextPage) {
    return <Text style={styles.olderMessagesText}>{t("older-messages")}</Text>;
  }

  if (hasNextPage === false) {
    return (
      <Text style={styles.olderMessagesText}>{t("no-older-messages")}</Text>
    );
  }

  return null;
};
