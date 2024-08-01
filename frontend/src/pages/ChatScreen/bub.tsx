import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { ChatMessage } from "../../interfaces/chat";
import { colors } from "../../colors/colors";

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar: boolean;
  renderAvatar: () => React.ReactNode;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar,
  renderAvatar,
}) => {
  const isOwnMessage = message.isOwnMessage;

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!isOwnMessage && (
        <View style={styles.avatarContainer}>
          {showAvatar ? (
            renderAvatar()
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      )}
      <View
        style={[
          styles.bubbleWrapper,
          isOwnMessage ? styles.ownBubbleWrapper : styles.otherBubbleWrapper,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <Text
            style={isOwnMessage ? styles.ownMessageText : styles.messageText}
          >
            {message.content}
          </Text>
          {message.images && message.images.length > 0 && (
            <Image
              source={{ uri: message.images[0] }}
              style={styles.messageImage}
            />
          )}
          <View style={styles.bottomRow}>
            <Text style={isOwnMessage ? styles.ownTimestamp : styles.timestamp}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 2,
    paddingHorizontal: 10,
  },
  ownMessage: {
    justifyContent: "flex-end",
  },
  otherMessage: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 32, // Adjust this value based on your avatar size
    marginRight: 8,
    alignSelf: "flex-end",
  },
  avatarPlaceholder: {
    width: 32, // Should match avatarContainer width
    height: 32, // Adjust this value based on your avatar size
  },
  bubbleWrapper: {
    maxWidth: "80%",
  },
  ownBubbleWrapper: {
    alignItems: "flex-end",
  },
  otherBubbleWrapper: {
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ownBubble: {
    backgroundColor: colors.ownBubble,
  },
  otherBubble: {
    backgroundColor: colors.senderBubble,
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  ownMessageText: {
    fontSize: 16,
    color: "#fff",
  },
  messageImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#8e8e93",
  },
  ownTimestamp: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
});

export default MessageBubble;
