import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { BASE_URL } from "../../services/axiosConfig";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import {
  useChatMessages,
  useSendMessage,
  useDeleteMessage,
  scrollToBottom,
} from "./chatUtils";
import ChatContents from "./ChatContents";
import ChatInput from "./ChatInput";
import CameraComponent from "../sell/CameraComponent";

type ChatScreenRouteProp = RouteProp<MainStackParamList, "Chat">;
type ChatScreenNavigationProp = StackNavigationProp<MainStackParamList, "Chat">;
interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { chatId } = route.params;
  const flatListRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [messageDeleted, setMessageDeleted] = useState(false);
  const { data: chatDetails, isLoading, refetch } = useChatMessages(chatId);
  const sendMessageMutation = useSendMessage(chatId);
  const deleteMessageMutation = useDeleteMessage(chatId);

  React.useEffect(() => {
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
  useEffect(() => {
    if (messageDeleted) {
      scrollToBottom(flatListRef, chatDetails?.messages.length || 0, false);
      setMessageDeleted(false);
    }
  }, [messageDeleted, chatDetails?.messages.length]);
  const handleSendMessage = useCallback(
    (message: string) => {
      sendMessageMutation.mutate(message);
    },
    [sendMessageMutation]
  );

  const handleContentSizeChange = useCallback(() => {
    scrollToBottom(flatListRef, chatDetails?.messages.length || 0, false);
  }, [chatDetails?.messages.length]);

  const handleOpenCamera = useCallback(() => {
    setIsCameraOpen(true);
  }, []);

  const handleCloseCamera = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  const handleCaptureImage = useCallback((uri: string) => {
    console.log("Image captured:", uri);
    setIsCameraOpen(false);
  }, []);

  const handleSelectImages = useCallback((uris: string[]) => {
    console.log("Images selected:", uris);
  }, []);

  const handleDeleteAndScroll = useCallback(
    async (messageId: string) => {
      try {
        await deleteMessageMutation.mutateAsync(messageId);
        // After deleting, scroll to the bottom
        setTimeout(() => {
          scrollToBottom(flatListRef, chatDetails?.messages.length || 0, false);
        }, 100);
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    },
    [deleteMessageMutation, chatDetails?.messages.length]
  );
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isCameraOpen) {
    return (
      <CameraComponent
        onCapture={handleCaptureImage}
        onClose={handleCloseCamera}
        onPickImages={handleSelectImages}
        currentImageCount={0}
      />
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
        otherParticipant={{
          profilePicture: chatDetails?.otherParticipant?.profilePicture,
        }}
        flatListRef={flatListRef}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleContentSizeChange}
        isLoading={isLoading}
        refetch={refetch}
        onDelete={handleDeleteAndScroll}
      />
      <ChatInput
        onSendMessage={handleSendMessage}
        onOpenCamera={handleOpenCamera}
        onSelectImages={handleSelectImages}
      />
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
