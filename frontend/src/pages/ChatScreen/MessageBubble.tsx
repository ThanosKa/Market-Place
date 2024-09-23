import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { ChatMessage } from "../../interfaces/chat";
import { colors } from "../../colors/colors";
import { t } from "i18next";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import ImageViewerModal from "../../utils/imageClick";

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar: boolean;
  renderAvatar: () => React.ReactNode;
  isSending?: boolean;
  isLastMessage: boolean;
  onDeleteMessage: (messageId: string) => void;
  senderId?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar,
  renderAvatar,
  isSending,
  isLastMessage,
  onDeleteMessage,
  senderId,
}) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const isOwnMessage = message.isOwnMessage;
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  const handleAvatarPress = () => {
    navigation.navigate("UserProfile", { userId: senderId || "" });
  };

  const handleLongPress = (isImage: boolean = false) => {
    const options = isOwnMessage
      ? isImage
        ? [t("delete"), t("cancel")]
        : [t("copy"), t("delete"), t("cancel")]
      : [t("copy"), t("cancel")];
    const destructiveButtonIndex = isOwnMessage ? (isImage ? 0 : 1) : undefined;
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        if (selectedIndex === undefined) return;

        if (isImage) {
          if (selectedIndex === 0 && isOwnMessage) {
            onDeleteMessage(message._id);
          }
        } else {
          switch (selectedIndex) {
            case 0:
              handleCopy();
              break;
            case 1:
              if (isOwnMessage) {
                onDeleteMessage(message._id);
              }
              break;
          }
        }
      }
    );
  };

  const handleCopy = async () => {
    if (message.content) {
      await Clipboard.setStringAsync(message.content);
      Toast.show({
        type: "info",
        text1: t("copied"),
        position: "bottom",
        bottomOffset: 100,
      });
    }
  };

  const openImageViewer = () => {
    setIsImageViewerVisible(true);
  };

  const closeImageModal = () => {
    setIsImageViewerVisible(false);
  };

  const renderImages = () => {
    if (!message.images || message.images.length === 0) return null;

    return (
      <View style={styles.imageWrapper}>
        {isOwnMessage && (
          <TouchableOpacity
            style={styles.optionsIcon}
            onPress={() => handleLongPress(true)}
          >
            <Feather name="more-vertical" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={openImageViewer}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: `${message.images[0]}` }}
            style={styles.image}
          />
          {message.images.length > 1 && (
            <View style={styles.moreImagesIndicator}>
              <Text style={styles.moreImagesText}>
                +{message.images.length - 1}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderStatus = () => {
    if (!isOwnMessage || !isLastMessage) return null;
    return (
      <Text style={styles.statusText}>
        {isSending ? t("sending") : message.seen ? t("seen") : t("sent")}
      </Text>
    );
  };

  return (
    <View style={styles.messageWrapper}>
      <View
        style={[
          styles.container,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <TouchableOpacity onPress={handleAvatarPress}>
                {renderAvatar()}
              </TouchableOpacity>
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
          {renderImages()}
          {message.content && (
            <TouchableOpacity onLongPress={() => handleLongPress()}>
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
            </TouchableOpacity>
          )}
        </View>
      </View>
      {renderStatus()}
      <ImageViewerModal
        images={message.images || []}
        isVisible={isImageViewerVisible}
        onClose={closeImageModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    marginBottom: 8,
  },
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
    marginTop: 4,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  moreImagesIndicator: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreImagesText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  optionsIcon: {
    padding: 5,
    marginRight: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 30,
  },
  imageViewerItem: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 100,
  },
  imageCounterContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  imageCounter: {
    color: "#fff",
    fontSize: 16,
  },
});

export default MessageBubble;
