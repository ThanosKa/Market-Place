import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { Chat } from "../../interfaces/chat";
import { BASE_URL } from "../../services/axiosConfig";
import { useQuery } from "react-query";
import { getUserChats } from "../../services/chat";
import { colors } from "../../colors/colors";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { t } from "i18next";
import { getTranslatableTimeString } from "../activity/activityUtils";

type MessageScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Messages"
>;

const MessageScreen: React.FC = () => {
  const navigation = useNavigation<MessageScreenNavigationProp>();
  const {
    data: chats,
    isLoading,
    refetch,
  } = useQuery("userChats", getUserChats);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - new Date(timestamp).getTime()) / (1000 * 60 * 60)
    );
    return `${diffInHours}${t("hr-ago")}`;
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const isUnread = item.unreadCount > 0;
    const messageColor = isUnread ? colors.primary : colors.secondary;

    let messageContent;
    let messageStyle;

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
      messageStyle = StyleSheet.flatten([
        styles.lastMessage,
        { color: messageColor, fontWeight: "600" },
      ]);
    } else {
      messageContent = item.lastMessage.content || t("sent-an-image");
      messageStyle = StyleSheet.flatten([
        styles.lastMessage,
        { color: messageColor },
      ]);
    }
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate("Chat", { chatId: item._id })}
      >
        {item.otherParticipant.profilePicture ? (
          <Image
            source={{
              uri: `${BASE_URL}/${item.otherParticipant.profilePicture}`,
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
            {item.otherParticipant.firstName} {item.otherParticipant.lastName}
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
    );
  };

  return (
    <View style={styles.container}>
      {chats && chats.length > 0 ? (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      ) : (
        <View style={styles.centered}>
          <Text>{t("no-messages-yet")}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  },
  statusMessage: {
    fontSize: 14,
    color: colors.secondary,
  },
  rightContent: {
    alignItems: "flex-end",
    width: 20,
  },
  timestamp: {
    fontSize: 12,
    color: "#8E8E8E",
  },
  // rightContent: {
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   width: 20, // Adjust as needed
  // },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "lightgrey",
  },
});

export default MessageScreen;
