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
import { BASE_URL } from "../../services/axiosConfig";
import { t } from "i18next";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar: boolean;
  renderAvatar: () => React.ReactNode;
  isSending?: boolean;
  isLastMessage: boolean;
  onDeleteMessage: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar,
  renderAvatar,
  isSending,
  isLastMessage,
  onDeleteMessage,
}) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const isOwnMessage = message.isOwnMessage;
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleLongPress = () => {
    if (!message.images || message.images.length === 0) {
      const options = isOwnMessage
        ? [t("copy"), t("delete"), t("cancel")]
        : [t("copy"), t("cancel")];
      const destructiveButtonIndex = isOwnMessage ? 1 : undefined;
      const cancelButtonIndex = isOwnMessage ? 2 : 1;

      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (selectedIndex: number | undefined) => {
          if (selectedIndex === undefined) return;

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
      );
    }
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

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageViewerVisible(true);
  };

  const closeImageModal = () => {
    setIsImageViewerVisible(false);
  };

  const renderImages = () => {
    if (!message.images || message.images.length === 0) return null;

    if (message.images.length === 1) {
      return (
        <TouchableOpacity onPress={() => openImageViewer(0)}>
          <Image
            source={{ uri: `${BASE_URL}${message.images[0]}` }}
            style={styles.singleImage}
          />
        </TouchableOpacity>
      );
    }

    const fanImages = message.images.slice(0, 5);
    const fanCenter = (fanImages.length - 1) / 2;

    return (
      <View style={styles.imageContainer}>
        {fanImages.map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => openImageViewer(index)}
            style={[
              styles.imageThumbnail,
              styles.fanImage,
              {
                zIndex: fanImages.length - index,
                transform: [
                  { rotate: `${(index - fanCenter) * 10}deg` },
                  { translateX: (index - fanCenter) * 20 },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: `${BASE_URL}${image}` }}
              style={styles.thumbnailImage}
            />
          </TouchableOpacity>
        ))}
        {message.images.length > 5 && (
          <View style={[styles.moreImagesIndicator, styles.fanImage]}>
            <Text style={styles.moreImagesText}>
              +{message.images.length - 5}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderImageViewerItem = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <View style={styles.imageViewerItem}>
      <Image
        source={{ uri: `${BASE_URL}${item}` }}
        style={styles.fullScreenImage}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <View>
      <TouchableOpacity onLongPress={handleLongPress}>
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
              isOwnMessage
                ? styles.ownBubbleWrapper
                : styles.otherBubbleWrapper,
            ]}
          >
            {renderImages()}
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
      </TouchableOpacity>
      {isOwnMessage && isLastMessage && (
        <Text style={styles.statusText}>
          {isSending ? t("sending") : message.seen ? t("seen") : t("sent")}
        </Text>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isImageViewerVisible}
        onRequestClose={closeImageModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeImageModal}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <FlatList
            ref={flatListRef}
            data={message.images}
            renderItem={renderImageViewerItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentImageIndex}
            onMomentumScrollEnd={(event) => {
              const contentOffset = event.nativeEvent.contentOffset;
              const viewSize = event.nativeEvent.layoutMeasurement;
              const pageNum = Math.floor(contentOffset.x / viewSize.width);
              setCurrentImageIndex(Math.max(0, pageNum));
            }}
            getItemLayout={(data, index) => ({
              length: Dimensions.get("window").width,
              offset: Dimensions.get("window").width * index,
              index,
            })}
          />
          <View style={styles.imageCounterContainer}>
            <Text style={styles.imageCounter}>
              {currentImageIndex + 1} / {message.images?.length}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 2,
    paddingHorizontal: 10,
    paddingBottom: 10,
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
  imageContainer: {
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    width: 150,
  },
  singleImage: {
    width: 110,
    height: 150,
    borderRadius: 10,
    marginBottom: 4,
  },
  imageThumbnail: {
    width: 110,
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
  },
  fanImage: {
    position: "absolute",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  moreImagesIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  moreImagesText: {
    color: "#fff",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
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
  imageCounter: {
    color: "#fff",
    fontSize: 16,
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
});

export default MessageBubble;
