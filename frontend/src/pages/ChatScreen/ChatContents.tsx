import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Pressable,
  Animated,
} from "react-native";
import { ChatMessage } from "../../interfaces/chat";
import { BASE_URL } from "../../services/axiosConfig";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import MessageOptions from "./MessageOption";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ChatContentsProps {
  messages: ChatMessage[];
  otherParticipant: {
    profilePicture?: string;
  };
  flatListRef: React.RefObject<FlatList<ChatMessage>>;
  onContentSizeChange: () => void;
  onLayout: () => void;
  isLoading: boolean;
  refetch: () => void;
  onDelete: (messageId: string) => Promise<void>;
}

const ChatContents: React.FC<ChatContentsProps> = ({
  messages,
  otherParticipant,
  flatListRef,
  onContentSizeChange,
  onLayout,
  isLoading,
  refetch,
  onDelete,
}) => {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const fadeAnims = useRef(
    new Map(messages.map((m) => [m._id, new Animated.Value(1)]))
  ).current;
  useEffect(() => {
    messages.forEach((message) => {
      if (!fadeAnims.has(message._id)) {
        fadeAnims.set(message._id, new Animated.Value(1));
      }
    });
  }, [messages, fadeAnims]);
  const handlePress = (messageId: string) => {
    setSelectedMessageId(messageId === selectedMessageId ? null : messageId);
  };

  const handleDelete = async (messageId: string) => {
    const fadeAnim = fadeAnims.get(messageId);
    if (fadeAnim) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(async () => {
        await onDelete(messageId);
        setSelectedMessageId(null);
      });
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: false });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [messages.length]);

  const renderMessage = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const isLastMessage =
      index === 0 || messages[index - 1].isOwnMessage !== item.isOwnMessage;
    const isSelected = selectedMessageId === item._id;
    const fadeAnim = fadeAnims.get(item._id) || new Animated.Value(1);

    return (
      <Animated.View style={[styles.messageWrapper, { opacity: fadeAnim }]}>
        <View
          style={[
            styles.messageRow,
            item.isOwnMessage ? styles.ownMessageRow : styles.otherMessageRow,
          ]}
        >
          {!item.isOwnMessage && isLastMessage && (
            <View style={styles.avatarContainer}>
              {otherParticipant.profilePicture ? (
                <Image
                  source={{
                    uri: `${BASE_URL}/${otherParticipant.profilePicture}`,
                  }}
                  style={styles.messageAvatar}
                />
              ) : (
                <UndefProfPicture size={28} iconSize={14} />
              )}
            </View>
          )}
          <Pressable
            onPress={() => handlePress(item._id)}
            style={({ pressed }) => [
              styles.messageContainer,
              item.isOwnMessage
                ? styles.ownMessageContainer
                : styles.otherMessageContainer,
              pressed && styles.messagePressed,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                item.isOwnMessage ? styles.ownMessage : styles.otherMessage,
                !item.isOwnMessage &&
                  !isLastMessage &&
                  styles.otherMessageAligned,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.isOwnMessage
                    ? styles.ownMessageText
                    : styles.otherMessageText,
                ]}
              >
                {item.content}
              </Text>
            </View>
          </Pressable>
          {isSelected && item.isOwnMessage && (
            <MessageOptions
              message={item}
              isOwnMessage={item.isOwnMessage}
              onDelete={() => handleDelete(item._id)}
            />
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages.slice().reverse()}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messageList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        // inverted
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  messagePressed: {
    opacity: 0.7,
  },
  messageContainer: {
    flexDirection: "row",
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
    alignSelf: "flex-start",
  },
  avatarContainer: {
    width: 28,
    marginRight: 8,
    alignSelf: "flex-end",
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 2,
  },
  ownMessage: {
    backgroundColor: "#0084ff",
  },
  otherMessage: {
    backgroundColor: "#f0f0f0",
  },
  otherMessageAligned: {
    marginLeft: 36,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: "#FFFFFF",
  },
  otherMessageText: {
    color: "#262626",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ownMessageRow: {
    justifyContent: "flex-end",
  },
  otherMessageRow: {
    justifyContent: "flex-start",
  },
  messageWrapper: {
    marginBottom: 4,
    overflow: "hidden",
  },
});

export default ChatContents;
