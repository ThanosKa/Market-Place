import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
  TextStyle,
} from "react-native";
import { BASE_URL } from "../../services/axiosConfig";
import { colors } from "../../colors/colors";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { getTranslatableTimeString } from "../activity/activityUtils";
import { renderStars } from "../../utils/renderStars";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
// import { StackNavigationProp } from "@react-navigation/stack";
// import { MainStackParamList } from "../../interfaces/auth/navigation";
import {
  RenderChatItemProps,
  RenderRightActionsProps,
  RenderUserItemProps,
} from "./MessageScreenTypes";

// type MessageScreenNavigationProp = StackNavigationProp<
//   MainStackParamList,
//   "Messages"
// >;

export const renderChatItem = ({
  item,
  navigation,
  t,
  renderRightActions,
  closeRow,
  rowRefs,
}: RenderChatItemProps) => {
  const isUnread = item.unreadCount > 0;
  const messageColor = isUnread ? colors.primary : colors.secondary;

  let messageContent = "";
  let messageStyle: TextStyle = styles.lastMessage;

  if (item.lastMessage) {
    if (item.lastMessage.isOwnMessage) {
      messageContent = item.lastMessage.seen
        ? `${t("seen")} ${getTranslatableTimeString(
            new Date(item.lastMessage.timestamp),
            t
          )}`
        : `${t("sent")} ${getTranslatableTimeString(
            new Date(item.lastMessage.timestamp),
            t
          )}`;
      messageStyle = styles.statusMessage;
    } else if (isUnread) {
      messageContent = `${item.unreadCount} ${
        item.unreadCount > 1 ? t("new-messages") : t("new-message")
      }`;
      messageStyle = {
        ...styles.lastMessage,
        color: messageColor,
        fontWeight: "600",
      };
    } else {
      // Check if it's an image message
      if (
        item.lastMessage.content === "" &&
        item.lastMessage.images &&
        item.lastMessage.images.length > 0
      ) {
        messageContent = t("sent-an-image");
      } else if (
        item.lastMessage.content === "" &&
        (!item.lastMessage.images || item.lastMessage.images.length === 0)
      ) {
        messageContent = t("no-messages");
      } else {
        messageContent = item.lastMessage.content || t("no-message-content");
      }
      messageStyle = { ...styles.lastMessage, color: messageColor };
    }
  } else {
    messageContent = t("no-messages");
    messageStyle = {
      ...styles.lastMessage,
      color: colors.secondary,
      fontStyle: "italic",
    };
  }
  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => closeRow()}
      ref={(ref) => (rowRefs.current[item._id] = ref)}
      overshootRight={false}
    >
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => {
          navigation.navigate("Chat", { chatId: item._id });
        }}
      >
        {item.otherParticipant?.profilePicture ? (
          <Image
            source={{
              uri: `${item.otherParticipant.profilePicture}`,
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatar}>
            <UndefProfPicture size={56} iconSize={24} />
          </View>
        )}
        <View style={styles.chatInfo}>
          <Text style={styles.participantName}>
            {item.otherParticipant?.firstName || t("unknown")}{" "}
            {item.otherParticipant?.lastName || ""}
          </Text>
          <Text style={messageStyle} numberOfLines={1}>
            {messageContent}
          </Text>
        </View>
        <View style={styles.rightContent}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: isUnread ? colors.customBlue : "lightgrey",
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export const renderUserItem = ({
  item,
  chats,
  createChatMutation,
  navigation,
}: RenderUserItemProps) => {
  const navigateToChat = async () => {
    if (!item || !item.id) {
      console.error("Invalid user item:", item);
      return;
    }

    let chatId: string;
    const existingChat = chats?.find(
      (chat) => chat.otherParticipant._id === item.id
    );

    if (existingChat) {
      chatId = existingChat._id;
    } else {
      try {
        const newChat = await createChatMutation.mutateAsync(item.id);
        if (!newChat || !newChat._id) {
          throw new Error("Failed to create chat");
        }
        chatId = newChat._id;
      } catch (error) {
        console.error("Error creating chat:", error);
        return;
      }
    }

    if (chatId) {
      navigation.navigate("Chat", { chatId });
    } else {
      console.error("No valid chatId found");
    }
  };

  return (
    <TouchableOpacity style={styles.userItem} onPress={navigateToChat}>
      {item.profilePicture ? (
        <Image
          source={{
            uri: `${item.profilePicture}`,
          }}
          style={styles.userImage}
        />
      ) : (
        <View style={styles.userImageUndef}>
          <UndefProfPicture size={40} iconSize={20} />
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstName} {item.lastName}
        </Text>

        <View style={styles.ratingContainer}>
          {renderStars(item.averageRating)}
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const renderRightActions = ({
  progress,
  dragX,
  chatId,
  handleDeleteChat,
}: RenderRightActionsProps) => {
  const scale = dragX.interpolate({
    inputRange: [-50, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  return (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDeleteChat(chatId)}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name="trash" size={24} color="white" />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  chatInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.secondary,
  },
  statusMessage: {
    fontSize: 14,
    color: colors.secondary,
  },
  rightContent: {
    alignItems: "flex-end",
    width: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "lightgrey",
  },
  userItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    alignItems: "center",
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  userImageUndef: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.secondary,
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 75,
  },
});
