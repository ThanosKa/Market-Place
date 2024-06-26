import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  PanResponder,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";
import {
  Ionicons,
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Swipeable from "react-native-gesture-handler/Swipeable";

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
  seen?: boolean;
  replyTo?: Message;
};

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Hey, how are you?",
    sender: "other",
    timestamp: new Date(Date.now() - 3600000),
    seen: true,
  },
  {
    id: "2",
    text: "I'm good, thanks! How about you?",
    sender: "user",
    timestamp: new Date(Date.now() - 3540000),
    seen: true,
  },
  {
    id: "3",
    text: "Great! Did you see the new product I listed?",
    sender: "other",
    timestamp: new Date(Date.now() - 3480000),
    seen: true,
  },
  {
    id: "4",
    text: "Yes, it looks amazing! I'm interested in buying it.",
    sender: "user",
    timestamp: new Date(Date.now() - 3420000),
    seen: true,
  },
  {
    id: "5",
    text: "That's fantastic! When would you like to meet up?",
    sender: "other",
    timestamp: new Date(Date.now() - 3360000),
    seen: false,
  },
];

const Chat: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState("");
  const { t } = useTranslation();
  const [replyMessage, setReplyMessage] = useState<Message | undefined>(
    undefined
  );
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [showTimestamps, setShowTimestamps] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        Animated.event([null, { dx: pan.x }], { useNativeDriver: false })(
          _,
          gestureState
        );
        setShowTimestamps(true);
      }
    },
    onPanResponderRelease: () => {
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
      setShowTimestamps(false);
    },
  });
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
        seen: false,
        replyTo: replyMessage,
      };
      setMessages([newMessage, ...messages]);
      setInputText("");
      setReplyMessage(undefined);
    }
  };

  const cancelReply = () => {
    setReplyMessage(undefined);
  };
  const renderMessage = ({ item }: { item: Message }) => {
    const swipeAction = () => (
      <View style={styles.replySwipe}>
        <MaterialCommunityIcons
          name="arrow-left-top"
          size={24}
          color={colors.primary}
        />
      </View>
    );

    return (
      <Swipeable
        ref={(ref) => (swipeableRefs.current[item.id] = ref)}
        renderLeftActions={swipeAction}
        onSwipeableLeftOpen={() => {
          setReplyMessage(item);
          swipeableRefs.current[item.id]?.close();
        }}
      >
        <View style={styles.messageWrapper}>
          <View style={styles.messageContentRow}>
            <View style={styles.messageContent}>
              {item.replyTo && (
                <View
                  style={[
                    styles.replyContainer,
                    item.sender === "user"
                      ? styles.replyContainerUser
                      : styles.replyContainerOther,
                  ]}
                >
                  <Text style={styles.replyText}>
                    {item.replyTo.sender === "user" ? "You" : "John Doe"}
                  </Text>
                  <Text style={styles.replyContent} numberOfLines={1}>
                    {item.replyTo.text}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.messageRow,
                  item.sender === "user"
                    ? styles.messageRowUser
                    : styles.messageRowOther,
                ]}
              >
                {item.sender === "other" && (
                  <Image
                    source={{ uri: "https://via.placeholder.com/40" }}
                    style={styles.messageProfileImage}
                  />
                )}
                <View
                  style={[
                    styles.messageBubble,
                    item.sender === "user"
                      ? styles.userMessage
                      : styles.otherMessage,
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
                </View>
              </View>
              {item.sender === "user" && item.seen && (
                <Text style={styles.seenText}>{t("seen")}</Text>
              )}
            </View>
            {showTimestamps && (
              <View style={styles.timestampColumn}>
                <Feather
                  name={
                    item.sender === "user"
                      ? "arrow-right-circle"
                      : "arrow-left-circle"
                  }
                  size={12}
                  color="#888"
                  style={styles.timestampIcon}
                />
                <Text style={styles.timestamp}>
                  {item.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Swipeable>
    );
  };

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
        <Animated.View
          style={[
            styles.messageContainer,
            { transform: [{ translateX: pan.x }] },
          ]}
          {...panResponder.panHandlers}
        >
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            inverted
            contentContainerStyle={styles.messageList}
          />
        </Animated.View>
        {replyMessage && (
          <View style={styles.replyInputContainer}>
            <View style={styles.replyInputContent}>
              <Text style={styles.replyInputLabel}>
                {t("replying-to")}{" "}
                {replyMessage.sender === "user" ? t("yourself") : "John Doe"}:{" "}
              </Text>
              <Text style={styles.replyInputText} numberOfLines={1}>
                {replyMessage.text}
              </Text>
            </View>
            <TouchableOpacity onPress={cancelReply}>
              <Ionicons name="close" size={20} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        )}
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
    borderRadius: 25,
  },

  replyText: {
    fontWeight: "bold",
    color: colors.primary,
    fontSize: 12,
  },
  replyContent: {
    color: "#666",
    fontSize: 12,
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  replyInputContent: {
    flex: 1,
    flexDirection: "column",
  },
  replyInputLabel: {
    fontSize: 14,
    color: colors.secondary,
  },
  replyInputText: {
    fontSize: 14,
    color: colors.primary,
  },
  replySwipe: {
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    height: "100%",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 20,
  },

  messageContainer: {
    flex: 1,
  },

  seenText: {
    fontSize: 10,
    color: colors.secondary,
    alignSelf: "flex-end",
    marginTop: 2,
  },
  messageWrapper: {
    marginVertical: 5,
    marginHorizontal: 10,
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
  messageProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
    marginBottom: 5,
  },
  timestampIcon: {
    marginRight: 2,
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
  },
  replyContainer: {
    backgroundColor: "rgba(224, 224, 224, 0.5)",
    padding: 5,
    borderRadius: 10,
    marginBottom: 2,
    maxWidth: "70%",
  },
  replyContainerUser: {
    alignSelf: "flex-end",
  },
  replyContainerOther: {
    alignSelf: "flex-start",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 2,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
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
  messageContentRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  messageContent: {
    flex: 1,
  },

  timestampColumn: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    marginLeft: 5,
    marginBottom: 5,
  },
});

export default Chat;
