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

  const renderChatItem = ({ item }: { item: Chat }) => {
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
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage.isOwnMessage ? "You: " : ""}
            {item.lastMessage.content || "No messages yet"}
          </Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.timestamp}>
            {new Date(item.lastMessage.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
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
          <Text>No messages yet</Text>
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
    color: "#8E8E8E",
  },
  rightContent: {
    alignItems: "flex-end",
  },
  timestamp: {
    fontSize: 12,
    color: "#8E8E8E",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default MessageScreen;
