import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { ChatMessage, PaginatedChatDetails } from "../../interfaces/chat";
import {
  getChatMessages,
  markMessagesAsSeen,
  sendMessage,
} from "../../services/chat";
import { BASE_URL } from "../../services/axiosConfig";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { colors } from "../../colors/colors";
import MessageBubble from "./bub";
import TextInputComponent from "./txtinput";

type ChatScreenRouteProp = RouteProp<MainStackParamList, "Chat">;
type ChatScreenNavigationProp = StackNavigationProp<MainStackParamList, "Chat">;

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { chatId } = route.params;
  const [message, setMessage] = useState("");
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

  const sendMessageMutation = useMutation(
    (newMessage: { content: string; images: File[] }) =>
      sendMessage(chatId, newMessage.content, newMessage.images),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["chatMessages", chatId]);
        setMessage("");
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

  const handleSendMessage = useCallback(() => {
    if (message.trim()) {
      sendMessageMutation.mutate({ content: message, images: [] });
    }
  }, [message, sendMessageMutation]);

  const flatListContent = data?.pages.flatMap((page) => page.messages) ?? [];

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const showAvatar =
        !item.isOwnMessage &&
        (index === 0 || flatListContent[index - 1].isOwnMessage);

      return (
        <MessageBubble
          message={item}
          showAvatar={showAvatar}
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
    [flatListContent]
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
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : null
        }
      />
      <TextInputComponent
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
});

export default ChatScreen;
