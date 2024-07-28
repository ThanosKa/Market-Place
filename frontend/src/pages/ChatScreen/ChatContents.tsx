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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { ChatMessage } from "../../interfaces/chat";
import { BASE_URL } from "../../services/axiosConfig";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import MessageOptions from "./MessageOption";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { t } from "i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ChatContentsProps {
  messages: ChatMessage[];
  otherParticipant: {
    _id?: string;
    profilePicture?: string;
  };
  navigation: StackNavigationProp<MainStackParamList>;
  flatListRef: React.RefObject<FlatList<ChatMessage>>;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onDelete: (messageId: string) => Promise<void>;
  refetch: () => void;
  isLoadingOldMessages: boolean;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  hasNextPage?: boolean;
}

const ChatContents: React.FC<ChatContentsProps> = ({
  messages,
  otherParticipant,
  navigation,
  flatListRef,
  isLoading,
  isFetchingNextPage,
  onLoadMore,
  onDelete,
  refetch,
  isLoadingOldMessages,
  onScroll,
  hasNextPage,
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

  const handleAvatarPress = (userId: string) => {
    navigation.navigate("UserProfile", { userId });
  };

  const renderAvatar = (sender: ChatMessage["sender"]) => {
    if (sender && sender.profilePicture) {
      return (
        <Pressable onPress={() => handleAvatarPress(sender._id)}>
          <Image
            source={{
              uri: `${BASE_URL}/${sender.profilePicture}`,
            }}
            style={styles.messageAvatar}
          />
        </Pressable>
      );
    } else {
      return (
        <Pressable onPress={() => sender && handleAvatarPress(sender._id)}>
          <View style={styles.messageAvatar}>
            <UndefProfPicture size={28} iconSize={14} />
          </View>
        </Pressable>
      );
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
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
          {!item.isOwnMessage && (
            <View style={styles.avatarContainer}>
              {renderAvatar(item.sender)}
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

  const renderItem = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    if (index > 0 && index % 20 === 0) {
      return (
        <>
          <Text style={styles.olderMessagesText}>
            {hasNextPage || index < messages.length - 1
              ? t("older-messages")
              : t("no-older-messages")}
          </Text>
          {renderMessage({ item })}
        </>
      );
    }
    return renderMessage({ item });
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages.slice().reverse()}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messageList}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isLoadingOldMessages}
            onRefresh={onLoadMore}
          />
        }
        onEndReachedThreshold={0.1}
        onScroll={onScroll}
        scrollEventThrottle={16}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 100,
        }}
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
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
  },
  olderMessagesText: {
    textAlign: "center",
    padding: 10,
    color: "#888",
  },
});

export default ChatContents;
