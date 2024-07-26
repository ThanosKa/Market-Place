import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import { ChatMessage } from "../../interfaces/chat";
import { BASE_URL } from "../../services/axiosConfig";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ChatContentsProps {
  messages: ChatMessage[];
  otherParticipant: {
    profilePicture?: string;
  };
  flatListRef: React.RefObject<FlatList<ChatMessage>>;
  onContentSizeChange: () => void;
  onLayout: () => void;
  isLoading: boolean;
  refetch: () => void;
}

const ChatContents: React.FC<ChatContentsProps> = ({
  messages,
  otherParticipant,
  flatListRef,
  onContentSizeChange,
  onLayout,
  isLoading,
  refetch,
}) => {
  const renderMessage = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const isLastMessage =
      index === messages.length - 1 ||
      messages[index + 1].isOwnMessage !== item.isOwnMessage;

    return (
      <View
        style={[
          styles.messageContainer,
          item.isOwnMessage
            ? styles.ownMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {!item.isOwnMessage && isLastMessage && (
          <View style={styles.avatarContainer}>
            {otherParticipant.profilePicture ? (
              <Image
                source={{
                  uri: `${BASE_URL}/${otherParticipant.profilePicture}`,
                }}
                style={styles.messageAvatar}
              />
            ) : (
              <UndefProfPicture size={28} iconSize={14} />
            )}
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            item.isOwnMessage ? styles.ownMessage : styles.otherMessage,
            !item.isOwnMessage && !isLastMessage && styles.otherMessageAligned,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.isOwnMessage
                ? styles.ownMessageText
                : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.messageList}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
    />
  );
};

const styles = StyleSheet.create({
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 4,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
    alignSelf: "flex-start",
  },
  avatarContainer: {
    width: 28,
    marginRight: 8,
    alignSelf: "flex-end",
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 2,
  },
  ownMessage: {
    backgroundColor: "#0084ff",
  },
  otherMessage: {
    backgroundColor: "#f0f0f0",
  },
  otherMessageAligned: {
    marginLeft: 36,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: "#FFFFFF",
  },
  otherMessageText: {
    color: "#262626",
  },
});

export default ChatContents;
