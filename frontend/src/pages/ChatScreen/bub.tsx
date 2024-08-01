import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { ChatMessage } from "../../interfaces/chat";
import { colors } from "../../colors/colors";
import { t } from "i18next";
import { BASE_URL } from "../../services/axiosConfig";

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar: boolean;
  renderAvatar: () => React.ReactNode;
  isSending?: boolean;
  isLastMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar,
  renderAvatar,
  isSending,
  isLastMessage,
}) => {
  const isOwnMessage = message.isOwnMessage;
  const getImageUri = (image: string) => {
    console.log("Processing image in MessageBubble:", image);
    if (image.startsWith("http://") || image.startsWith("https://")) {
      console.log("Full URL");
      return image;
    } else {
      console.log("Relative path, prepending BASE_URL");
      return `${BASE_URL}${image}`;
    }
  };
  console.log("Rendering message:", message);
  return (
    <View>
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
          {message.images && message.images.length > 0 && (
            <ScrollView horizontal={true} style={styles.imageScrollView}>
              {message.images.map((image, index) => {
                const uri = getImageUri(image);
                console.log(`Image ${index} URI:`, uri);
                return (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.messageImage}
                    onError={(error) =>
                      console.error(
                        `Error loading image ${index}:`,
                        error.nativeEvent.error
                      )
                    }
                  />
                );
              })}
            </ScrollView>
          )}
          {message.content && (
            <View
              style={[
                styles.bubble,
                isOwnMessage ? styles.ownBubble : styles.otherBubble,
              ]}
            >
              <Text
                style={
                  isOwnMessage ? styles.ownMessageText : styles.messageText
                }
              >
                {message.content}
              </Text>
              <Text
                style={isOwnMessage ? styles.ownTimestamp : styles.timestamp}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
      {isOwnMessage && isLastMessage && (
        <Text style={styles.statusText}>
          {isSending ? t("sending") : message.seen ? t("seen") : t("sent")}
        </Text>
      )}
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
    width: 32,
    marginRight: 8,
    alignSelf: "flex-end",
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
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
    marginTop: 4,
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
  timestamp: {
    fontSize: 12,
    color: "#8e8e93",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  ownTimestamp: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.secondary,
    alignSelf: "flex-end",
    marginRight: 15,
    marginTop: 2,
    marginBottom: 12,
  },
  imageScrollView: {
    flexDirection: "row",
    marginBottom: 4,
  },
  messageImage: {
    width: Dimensions.get("window").width * 0.6,
    height: Dimensions.get("window").width * 0.6,
    borderRadius: 10,
    marginRight: 8,
  },
});

export default MessageBubble;
