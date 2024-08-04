import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useQuery, useInfiniteQuery, useMutation } from "react-query";
import { createChat, deleteChat, getUserChats } from "../../services/chat";
import { getAllUsersInfo } from "../../services/user";
import { Swipeable } from "react-native-gesture-handler";
import { Chat } from "../../interfaces/chat";
import { User } from "../../interfaces/user";
import { t } from "i18next";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../../components/SearchBarComponenet";
import {
  renderChatItem,
  renderUserItem,
  renderRightActions,
} from "./MessageScreenUtils";
import { colors } from "../../colors/colors";
import {
  PaginatedUsersResponse,
  MessageScreenNavigationProp,
} from "./MessageScreenTypes";
const MessageScreen: React.FC = () => {
  const navigation = useNavigation<MessageScreenNavigationProp>();
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  let prevOpenedRow: Swipeable | null = null;
  const rowRefs = useRef<{ [key: string]: Swipeable | null }>({});

  const {
    data: chats,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useQuery<Chat[], Error>("userChats", getUserChats);

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

  const closeAllRows = () => {
    Object.values(rowRefs.current).forEach((ref) => {
      if (ref) {
        ref.close();
      }
    });
    prevOpenedRow = null;
  };

  const closeRow = (id: string) => {
    if (prevOpenedRow && prevOpenedRow !== rowRefs.current[id]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = rowRefs.current[id];
  };

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      closeAllRows();
      Alert.alert(t("delete-chat"), t("delete-chat-permanently"), [
        {
          text: t("cancel"),
          style: "cancel",
          onPress: closeAllRows,
        },
        {
          text: t("delete"),
          onPress: async () => {
            try {
              await deleteChat(chatId);
              refetchChats();
            } catch (error) {
              console.error("Error deleting chat:", error);
              Alert.alert(t("error"), t("failed-to-delete-chat"));
            } finally {
              closeAllRows();
            }
          },
          style: "destructive",
        },
      ]);
    },
    [refetchChats, t, closeAllRows]
  );

  const createChatMutation = useMutation(createChat);

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
            renderItem={({ item }) =>
              renderUserItem({
                item,
                chats,
                createChatMutation,
                navigation,
              })
            }
            keyExtractor={(item: User) => item.id}
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
          renderItem={({ item }) =>
            renderChatItem({
              item,
              navigation,
              t,
              renderRightActions: (progress, dragX) =>
                renderRightActions({
                  progress,
                  dragX,
                  chatId: item._id,
                  handleDeleteChat,
                }),
              closeRow: () => closeRow(item._id),
              rowRefs,
            })
          }
          keyExtractor={(item: Chat) => item._id}
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
  dummySearchBar: {
    marginHorizontal: 10,
    marginBottom: 10,
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
  messageContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingLeft: 16,
  },
  messageText: {
    fontSize: 16,
    color: colors.secondary,
  },
});

export default MessageScreen;
