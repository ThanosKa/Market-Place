import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
  Pressable,
  Dimensions,
} from "react-native";
import { RouteProp, useIsFocused } from "@react-navigation/native";
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
import { AntDesign } from "@expo/vector-icons";

type ChatScreenRouteProp = RouteProp<MainStackParamList, "Chat">;
type ChatScreenNavigationProp = StackNavigationProp<MainStackParamList, "Chat">;
interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { chatId } = route.params;
  const flatListRef = useRef<FlatList | null>(null);
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [messageDeleted, setMessageDeleted] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useChatMessages(chatId);
  const sendMessageMutation = useSendMessage(chatId);
  const deleteMessageMutation = useDeleteMessage(chatId);

  useEffect(() => {
    if (data?.pages[0]) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.headerTitle}>
            {data.pages[0].otherParticipant.profilePicture ? (
              <Image
                source={{
                  uri: `${BASE_URL}/${data.pages[0].otherParticipant.profilePicture}`,
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
                {data.pages[0].otherParticipant.firstName}{" "}
                {data.pages[0].otherParticipant.lastName}
              </Text>
              <Text style={styles.headerStatus}>Active now</Text>
            </View>
          </View>
        ),
      });
    }
  }, [data, navigation]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (messageDeleted) {
      scrollToBottom(flatListRef, data?.pages[0]?.messages.length || 0, false);
      setMessageDeleted(false);
    }
  }, [messageDeleted, data?.pages[0]?.messages.length]);
  useEffect(() => {
    if (isFocused && data?.pages[0]?.messages.length) {
      handleScrollToBottom();
    }
  }, [isFocused, data?.pages[0]?.messages.length]);
  const handleScrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSendMessage = useCallback(
    (message: string) => {
      sendMessageMutation.mutate(message, {
        onSuccess: () => {
          handleScrollToBottom(); // Changed this to use handleScrollToBottom
        },
      });
    },
    [sendMessageMutation, handleScrollToBottom]
  );

  const handleContentSizeChange = useCallback(() => {
    if (!isLoadingOldMessages) {
      scrollToBottom(flatListRef, data?.pages[0]?.messages.length || 0, false);
    }
  }, [data?.pages[0]?.messages.length, isLoadingOldMessages]);

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
        console.log("Delete", messageId);
        await deleteMessageMutation.mutateAsync(messageId);
        setMessageDeleted(true);
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    },
    [deleteMessageMutation]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      setShowScrollButton(currentOffset <= 500);
    },
    []
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      setIsLoadingOldMessages(true);
      fetchNextPage().then(() => {
        setIsLoadingOldMessages(false);
      });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allMessages = data ? data.pages.flatMap((page) => page.messages) : [];

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
        messages={allMessages}
        otherParticipant={data?.pages[0]?.otherParticipant || {}}
        navigation={navigation}
        flatListRef={flatListRef}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={handleLoadMore}
        onDelete={handleDeleteAndScroll}
        refetch={refetch}
        onScroll={handleScroll}
        isLoadingOldMessages={isLoadingOldMessages}
        hasNextPage={hasNextPage}
      />
      {showScrollButton && (
        <Pressable style={styles.scrollButton} onPress={handleScrollToBottom}>
          <AntDesign name="arrowdown" size={24} color="#000" />
        </Pressable>
      )}
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
  scrollButton: {
    position: "absolute",
    bottom: 100,
    left: (SCREEN_WIDTH - 50) / 2,
    backgroundColor: "white",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ChatScreen;
