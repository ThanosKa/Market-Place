import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
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
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === message.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? message.images.length - 1 : prevIndex - 1
    );
  };

  const renderImages = () => {
    if (!message.images || message.images.length === 0) return null;

    if (message.images.length === 1) {
      return (
        <TouchableOpacity onPress={() => openImageModal(0)}>
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
            onPress={() => openImageModal(index)}
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
      {isOwnMessage && isLastMessage && (
        <Text style={styles.statusText}>
          {isSending ? t("sending") : message.seen ? t("seen") : t("sent")}
        </Text>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeImageModal}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageScrollContainer}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x /
                  Dimensions.get("window").width
              );
              setCurrentImageIndex(newIndex);
            }}
          >
            {message.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: `${BASE_URL}${image}` }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {message.images.length}
            </Text>
          </View>
        </View>
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
  imageScrollView: {
    flexDirection: "row",
    marginBottom: 4,
  },
  messageImage: {
    width: 130,
    height: 200,
    borderRadius: 10,
    marginRight: 8,
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
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 40,
  },
  imageScrollContainer: {
    alignItems: "center",
  },
  fullScreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  imageCounter: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  imageCounterText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default MessageBubble;
