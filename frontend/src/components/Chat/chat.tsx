import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  SafeAreaView,
  Platform,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";
import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

type ChatScreenRouteProp = RouteProp<MainStackParamList, "Chat">;
type ChatScreenNavigationProp = StackNavigationProp<MainStackParamList, "Chat">;

type Props = {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
};

type Message = {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
};

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Hey, how are you?",
    sender: "other",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    text: "I'm good, thanks! How about you?",
    sender: "user",
    timestamp: new Date(Date.now() - 3540000),
  },
  {
    id: "3",
    text: "Great! Did you see the new product I listed?",
    sender: "other",
    timestamp: new Date(Date.now() - 3480000),
  },
  {
    id: "4",
    text: "Yes, it looks amazing! I'm interested in buying it.",
    sender: "user",
    timestamp: new Date(Date.now() - 3420000),
  },
  {
    id: "5",
    text: "That's fantastic! When would you like to meet up?",
    sender: "other",
    timestamp: new Date(Date.now() - 3360000),
  },
];

const Chat: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    // Fetch initial messages or set up real-time listener
  }, []);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: "user",
        timestamp: new Date(),
      };
      setMessages([newMessage, ...messages]);
      setInputText("");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userMessage : styles.otherMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "user"
            ? styles.userMessageText
            : styles.otherMessageText,
        ]}
      >
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  const renderInputIcons = () => {
    if (inputText.length > 0) {
      return (
        <Text style={styles.sendButton} onPress={sendMessage}>
          {t("send")}
        </Text>
      );
    } else {
      return (
        <View style={styles.inputIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="mic" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="image" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Image
            source={{ uri: "https://via.placeholder.com/40" }}
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userStatus}>Online</Text>
          </View>
        </View>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messageList}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.cameraButton}>
            <FontAwesome name="camera" size={18} color="white" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message..."
            placeholderTextColor="#999"
          />
          {renderInputIcons()}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    marginTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  userStatus: {
    fontSize: 12,
    color: "#888",
  },
  messageList: {
    paddingVertical: 20,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cameraButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: colors.primary,
    borderRadius: 25,
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  inputIcons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 5,
    marginLeft: 5,
  },
  sendButton: {
    padding: 5,
    color: colors.primary,
    // backgroundColor: colors.primary,
    // borderRadius: 25,
  },
});

export default Chat;
