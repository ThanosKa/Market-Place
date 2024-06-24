import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";
import Header from "../UserProfile/header";
import SearchBar from "../SearchBarComponenet";
import { Swipeable } from "react-native-gesture-handler";

type MessageScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Messages"
>;

interface Message {
  id: string;
  userName: string;
  userImage: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

const mockMessages: Message[] = [
  {
    id: "1",
    userName: "John Doe",
    userImage: "https://randomuser.me/api/portraits/men/1.jpg",
    lastMessage: "Hey, how are you?",
    time: "Just now",
    unread: true,
  },
  {
    id: "2",
    userName: "Jane Smith",
    userImage: "https://randomuser.me/api/portraits/women/1.jpg",
    lastMessage: "The product looks great!",
    time: "5m ago",
    unread: false,
  },
  // Add more mock messages here
];
const MessageScreen: React.FC = () => {
  const navigation = useNavigation<MessageScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [messages, setMessages] = useState(mockMessages);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const cancelSearch = () => {
    setSearchQuery("");
    setIsFocused(false);
  };

  const handleBackPress = () => navigation.goBack();

  const deleteMessage = (id: string) => {
    setMessages(messages.filter((message) => message.id !== id));
  };

  const renderRightActions = (id: string) => {
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteMessage(id)}
        >
          <Ionicons name="trash-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <Pressable
        style={({ pressed }) => [
          styles.messageItem,
          pressed && styles.messageItemPressed,
        ]}
        onPress={() => navigation.navigate("Chat", { userId: item.id })}
      >
        <Image source={{ uri: item.userImage }} style={styles.userImage} />
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={[styles.userName, item.unread && styles.unreadText]}>
              {item.userName}
            </Text>
            <Text
              style={[styles.messageTime, item.unread && styles.unreadText]}
            >
              {item.time}
            </Text>
          </View>
          <View style={styles.messageFooter}>
            <Text
              style={[styles.lastMessage, item.unread && styles.unreadText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.lastMessage}
            </Text>
            {item.unread && <View style={styles.unreadDot} />}
            <TouchableOpacity style={styles.cameraIcon}>
              <Ionicons
                name="camera-outline"
                size={24}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <Header onBackPress={handleBackPress} />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        clearSearch={clearSearch}
        cancelSearch={cancelSearch}
      />

      <Text style={styles.sectionTitle}>Messages</Text>

      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  messageList: {
    paddingHorizontal: 5,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.background,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  messageTime: {
    fontSize: 12,
    color: colors.secondary,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
  },
  unreadText: {
    color: colors.primary,
    fontWeight: "600",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 8,
  },
  cameraIcon: {
    marginLeft: 8,
  },
  rightActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16, // Add margin to the right
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    // borderRadius: 30,
    marginLeft: 8,
  },
  // deleteButton: {
  //   backgroundColor: "red",
  //   justifyContent: "center",
  //   alignItems: "flex-end",
  //   width: 70,
  //   height: "100%",
  // },
  deleteButtonIcon: {
    // padding: 20,
  },

  messageItemPressed: {
    backgroundColor: colors.lightGray,
  },
});

export default MessageScreen;
