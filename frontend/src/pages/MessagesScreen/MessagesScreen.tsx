import React, { useState, useCallback } from "react";
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
import { useQuery, useInfiniteQuery } from "react-query";
import { getUserChats } from "../../services/chat";
import { colors } from "../../colors/colors";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { t } from "i18next";
import { getTranslatableTimeString } from "../activity/activityUtils";
import SearchBar from "../../components/SearchBarComponenet";
import { Ionicons } from "@expo/vector-icons";
import { getAllUsersInfo } from "../../services/user";
import { User } from "../../interfaces/user";
import { renderStars } from "../../utils/renderStars";

interface PaginatedUsersResponse {
  success: number;
  message: string;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
}

type MessageScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Messages"
>;

const MessageScreen: React.FC = () => {
  const navigation = useNavigation<MessageScreenNavigationProp>();
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const {
    data: chats,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useQuery("userChats", getUserChats);

  const {
    data: usersData,
    fetchNextPage,
    hasNextPage,
    isLoading: usersLoading,
  } = useInfiniteQuery<PaginatedUsersResponse, Error>(
    ["allUsers", searchQuery],
    ({ pageParam = 1 }) => getAllUsersInfo(pageParam, 10, searchQuery),
    {
      getNextPageParam: (lastPage) =>
        lastPage.data.page <
        Math.ceil(lastPage.data.total / lastPage.data.limit)
          ? lastPage.data.page + 1
          : undefined,
      enabled: !!searchQuery,
    }
  );

  useFocusEffect(
    useCallback(() => {
      refetchChats();
    }, [refetchChats])
  );

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const cancelSearch = useCallback(() => {
    setShowSearchBar(false);
    setSearchQuery("");
    setIsFocused(false);
  }, []);

  const renderChatItem = useCallback(({ item }: { item: Chat }) => {
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
  }, []);

  const renderUserItem = useCallback(({ item }: { item: User }) => {
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => console.log(item.id)}
      >
        {item.profilePicture ? (
          <Image
            source={{
              uri: `${BASE_URL}/${item.profilePicture}`,
            }}
            style={styles.userImage}
          />
        ) : (
          <View style={styles.userImageUndef}>
            <UndefProfPicture size={40} iconSize={20} />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.firstName} {item.lastName}
          </Text>

          <View style={styles.ratingContainer}>
            {renderStars(item.averageRating)}
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const loadMoreUsers = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  return (
    <View style={styles.container}>
      {showSearchBar ? (
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={handleSearch}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          clearSearch={clearSearch}
          cancelSearch={cancelSearch}
        />
      ) : (
        <TouchableOpacity
          style={styles.dummySearchBar}
          onPress={() => setShowSearchBar(true)}
        >
          <View style={styles.dummySearchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={colors.primary}
              style={styles.searchIcon}
            />
            <Text style={styles.dummySearchText}>{t("search")}</Text>
          </View>
        </TouchableOpacity>
      )}

      {showSearchBar ? (
        searchQuery ? (
          <FlatList
            data={usersData?.pages.flatMap((page) => page?.data.users) || []}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            onEndReached={loadMoreUsers}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl refreshing={usersLoading} onRefresh={() => {}} />
            }
            ListEmptyComponent={
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>{t("no-users-found")}</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{t("search-users")}</Text>
          </View>
        )
      ) : chats && chats.length > 0 ? (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={chatsLoading}
              onRefresh={refetchChats}
            />
          }
        />
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{t("no-messages-yet")}</Text>
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

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "lightgrey",
  },
  dummySearchBar: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  messageContainer: {
    flex: 1,
    // justifyContnt: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingLeft: 16,
  },
  messageText: {
    fontSize: 16,
    color: colors.secondary,
  },
  dummySearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  dummySearchText: {
    flex: 1,
    fontSize: 16,
    color: colors.secondary,
  },
  userItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    alignItems: "center",
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  userImageUndef: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
  },
  userEmail: {
    fontSize: 14,
    color: "#8E8E8E",
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
    marginBottom: 4,
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.secondary,
  },
});

export default MessageScreen;
