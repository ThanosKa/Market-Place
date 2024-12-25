// SearchScreen.tsx
import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import debounce from "lodash.debounce";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { colors } from "../../colors/colors";
import SearchBar from "../../components/SearchBarComponenet";
import SearchButton from "./helpers/SearchButton";
import SearchTabs from "./helpers/SearchTabs";
import SearchContent from "./helpers/SearchContent";

import { getProducts } from "../../services/product";
import { getAllUsersInfo } from "../../services/user";
import {
  getRecentSearches,
  addRecentSearch,
  deleteRecentSearch,
  deleteAllRecentSearches,
} from "../../services/recentSearch";

import { MainStackParamList } from "../../interfaces/auth/navigation";
import { RecentSearch } from "../../interfaces/recentSearch";

type SearchScreenRouteProp = RouteProp<MainStackParamList, "Search">;

const SearchScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const route = useRoute<SearchScreenRouteProp>();

  // State Management
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "users">("products");
  const [showTabs, setShowTabs] = useState(false);

  // Debounce Search
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setDebouncedSearchQuery(text);
      setIsSearching(false);
    }, 300),
    []
  );

  // Route Params Effect
  useEffect(() => {
    if (route.params?.refreshSearch) {
      onRefresh();
    }
  }, [route.params?.refreshSearch]);

  // Products Query
  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage: fetchNextProducts,
    hasNextPage: hasNextProductsPage,
    isFetchingNextPage: isFetchingNextProducts,
    refetch: refetchProducts,
  } = useInfiniteQuery(
    ["products", debouncedSearchQuery],
    ({ pageParam = 1 }) =>
      getProducts({ search: debouncedSearchQuery, page: pageParam, limit: 10 }),
    {
      getNextPageParam: (lastPage) => {
        if (
          lastPage.data.page <
          Math.ceil(lastPage.data.total / lastPage.data.limit)
        ) {
          return lastPage.data.page + 1;
        }
        return undefined;
      },
      enabled: !isFocused || (isFocused && debouncedSearchQuery.length > 0),
    }
  );

  // Users Query
  const {
    data: usersData,
    isLoading: usersLoading,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasNextUsersPage,
    isFetchingNextPage: isFetchingNextUsers,
  } = useInfiniteQuery(
    ["users", searchQuery],
    ({ pageParam = 1 }) => getAllUsersInfo(pageParam, 10, searchQuery),
    {
      enabled: showTabs && activeTab === "users",
      getNextPageParam: (lastPage) =>
        lastPage.data.page <
        Math.ceil(lastPage.data.total / lastPage.data.limit)
          ? lastPage.data.page + 1
          : undefined,
    }
  );

  // Recent Searches Query
  const {
    data: recentSearchesData,
    isLoading: recentSearchesLoading,
    fetchNextPage: fetchNextRecentSearches,
    hasNextPage: hasNextRecentSearchesPage,
    isFetchingNextPage: isFetchingNextRecentSearches,
    refetch: refetchRecentSearches,
  } = useInfiniteQuery(
    "recentSearches",
    ({ pageParam = 1 }) => getRecentSearches({ page: pageParam, limit: 10 }),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.data.page < lastPage.data.totalPages) {
          return lastPage.data.page + 1;
        }
        return undefined;
      },
      enabled: isFocused && searchQuery.length === 0,
    }
  );

  // Mutations
  const addRecentSearchMutation = useMutation(addRecentSearch, {
    onSuccess: () => {
      queryClient.invalidateQueries("recentSearches");
    },
  });

  const deleteRecentSearchMutation = useMutation(
    (id: string) => deleteRecentSearch(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("recentSearches");
      },
    }
  );

  const deleteAllRecentSearchesMutation = useMutation(
    () => deleteAllRecentSearches(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("recentSearches");
      },
    }
  );

  // Handlers
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setIsSearching(true);
    debouncedSearch(text);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowTabs(true);
    }
  };

  const handleShowSearch = () => {
    setShowSearchBar(true);
    setIsFocused(true);
  };

  const cancelSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setIsFocused(false);
    setShowSearchBar(false);
    setShowTabs(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setShowTabs(false);
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate("UserProfile", { userId });
  };

  const handleRecentSearchClick = (search: RecentSearch) => {
    if (search.type === "product") {
      // Navigate to product details
      navigation.navigate("Product", { productId: search.product.id });
    } else {
      // Navigate to user profile
      navigation.navigate("UserProfile", { userId: search.user.id });
    }
  };

  const handleClickSearchedProduct = (productId: string) => {
    navigation.navigate("Product", { productId });
    addRecentSearchMutation.mutate({
      query: searchQuery,
      productId: productId,
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refetchProducts(), refetchRecentSearches()]).then(() => {
      setRefreshing(false);
    });
  }, [refetchProducts, refetchRecentSearches]);

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
          onSubmitEditing={handleSearchSubmit}
        />
      ) : (
        <SearchButton onPress={handleShowSearch} />
      )}

      {showTabs && (
        <SearchTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <SearchContent
        isFocused={isFocused}
        searchQuery={searchQuery}
        showTabs={showTabs}
        activeTab={activeTab}
        isSearching={isSearching}
        products={
          productsData?.pages?.flatMap((page) => page?.data?.products) ?? []
        }
        users={usersData?.pages?.flatMap((page) => page?.data?.users) ?? []}
        recentSearches={
          recentSearchesData?.pages?.flatMap(
            (page) => page?.data?.recentSearches
          ) ?? []
        }
        productsLoading={productsLoading}
        usersLoading={usersLoading}
        recentSearchesLoading={recentSearchesLoading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        handleClickSearchedProduct={handleClickSearchedProduct}
        handleClickRecentSearch={handleRecentSearchClick}
        handleUserPress={handleUserPress}
        deleteRecentSearch={(id) => deleteRecentSearchMutation.mutate(id)}
        deleteAllRecentSearches={() => deleteAllRecentSearchesMutation.mutate()}
        loadMoreProducts={() => {
          if (hasNextProductsPage && !isFetchingNextProducts) {
            fetchNextProducts();
          }
        }}
        loadMoreUsers={() => {
          if (hasNextUsersPage && !isFetchingNextUsers) {
            fetchNextUsers();
          }
        }}
        loadMoreRecentSearches={() => {
          if (hasNextRecentSearchesPage && !isFetchingNextRecentSearches) {
            fetchNextRecentSearches();
          }
        }}
        hasMoreProducts={!!hasNextProductsPage}
        hasMoreUsers={!!hasNextUsersPage}
        hasMoreRecentSearches={!!hasNextRecentSearchesPage}
        isLoadingMoreProducts={isFetchingNextProducts}
        isLoadingMoreUsers={isFetchingNextUsers}
        isLoadingMoreRecentSearches={isFetchingNextRecentSearches}
        isDeletingAllRecentSearches={deleteAllRecentSearchesMutation.isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
});

export default SearchScreen;
