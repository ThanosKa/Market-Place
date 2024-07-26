import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { BASE_URL } from "../../services/axiosConfig";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { useChatMessages, useSendMessage, scrollToBottom } from "./chatUtils";
import ChatContents from "./ChatContents";
import ChatInput from "./ChatInput";

type ChatScreenRouteProp = RouteProp<MainStackParamList, "Chat">;
type ChatScreenNavigationProp = StackNavigationProp<MainStackParamList, "Chat">;
interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { chatId } = route.params;
  const flatListRef = useRef(null);

  const { data: chatDetails, isLoading, refetch } = useChatMessages(chatId);
  const sendMessageMutation = useSendMessage(chatId);

  useEffect(() => {
    if (chatDetails) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.headerTitle}>
            {chatDetails.otherParticipant.profilePicture ? (
              <Image
                source={{
                  uri: `${BASE_URL}/${chatDetails.otherParticipant.profilePicture}`,
                }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={styles.headerAvatar}>
                <UndefProfPicture size={36} iconSize={18} />
              </View>
            )}
            <View>
              <Text style={styles.headerName}>
                {chatDetails.otherParticipant.firstName}{" "}
                {chatDetails.otherParticipant.lastName}
              </Text>
              <Text style={styles.headerStatus}>Active now</Text>
            </View>
          </View>
        ),
      });
    }
  }, [chatDetails, navigation]);

  const handleSendMessage = useCallback(
    (message: string) => {
      sendMessageMutation.mutate(message);
    },
    [sendMessageMutation]
  );

  const handleContentSizeChange = useCallback(() => {
    scrollToBottom(flatListRef, chatDetails?.messages.length || 0, false);
  }, [chatDetails?.messages.length]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ChatContents
        messages={chatDetails?.messages || []}
        otherParticipant={chatDetails?.otherParticipant || {}}
        flatListRef={flatListRef}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleContentSizeChange}
        isLoading={isLoading}
        refetch={refetch}
      />
      <ChatInput onSendMessage={handleSendMessage} />
    </KeyboardAvoidingView>
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
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
  },
  headerStatus: {
    fontSize: 12,
    color: "#8e8e8e",
  },
});

export default ChatScreen;
