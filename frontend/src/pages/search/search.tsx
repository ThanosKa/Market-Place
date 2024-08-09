import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import debounce from "lodash.debounce";
import { RouteProp, useRoute } from "@react-navigation/native";

import { colors } from "../../colors/colors";
import SearchBar from "../../components/SearchBarComponenet";
import SearchButton from "./helpers/SearchButton";
import SearchResults from "./helpers/SearchResults";
import RecentSearches from "./helpers/RecentSearches";
import ProductGrid from "./helpers/ProductGrid";

import { getProducts } from "../../services/product";
import {
  getRecentSearches,
  addRecentSearch,
  deleteRecentSearch,
  deleteAllRecentSearches,
} from "../../services/recentSearch";

import { MainStackParamList } from "../../interfaces/auth/navigation";

type SearchScreenRouteProp = RouteProp<MainStackParamList, "Search">;

const SearchScreen = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const route = useRoute<SearchScreenRouteProp>();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setDebouncedSearchQuery(text);
    }, 300),
    []
  );

  useEffect(() => {
    if (route.params?.refreshSearch) {
      onRefresh();
    }
  }, [route.params?.refreshSearch]);

  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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

  const {
    data: recentSearchesData,
    isLoading: recentSearchesLoading,
    fetchNextPage: fetchNextRecentSearchesPage,
    hasNextPage: hasNextRecentSearchesPage,
    isFetchingNextPage: isFetchingNextRecentSearchesPage,
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
  const recentSearches =
    recentSearchesData?.pages?.flatMap((page) => page.data.recentSearches) ||
    [];

  const addRecentSearchMutation = useMutation(addRecentSearch, {
    onSuccess: () => {
      queryClient.invalidateQueries("recentSearches");
    },
  });

  const deleteRecentSearchMutation = useMutation(deleteRecentSearch, {
    onSuccess: () => {
      queryClient.invalidateQueries("recentSearches");
    },
  });

  const deleteAllRecentSearchesMutation = useMutation(deleteAllRecentSearches, {
    onSuccess: () => {
      refetchRecentSearches();
    },
  });
  const loadMoreRecentSearches = () => {
    if (hasNextRecentSearchesPage && !isFetchingNextRecentSearchesPage) {
      fetchNextRecentSearchesPage();
    }
  };

  const products =
    productsData?.pages?.flatMap((page) => page.data.products) || [];

  const handleShowSearch = () => {
    setShowSearchBar(true);
    setIsFocused(true);
  };

  const cancelSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setIsFocused(false);
    setShowSearchBar(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const handleClickRecentSearch = (productId: string) => {
    console.log("Recent search product clicked:", productId);
  };

  const handleClickSearchedProduct = (productId: string) => {
    console.log("Searched product clicked:", productId);
    addRecentSearchMutation.mutate({
      query: searchQuery,
      productId: productId,
    });
  };

  const handleDeleteRecentSearch = (id: string) => {
    deleteRecentSearchMutation.mutate(id);
  };

  const handleClearAllRecentSearches = () => {
    deleteAllRecentSearchesMutation.mutate();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refetchProducts(), refetchRecentSearches()]).then(() => {
      setRefreshing(false);
    });
  }, [refetchProducts, refetchRecentSearches]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  );

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
        <SearchButton onPress={handleShowSearch} />
      )}

      {!isFocused && (
        <>
          {productsLoading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : products.length > 0 ? (
            <ProductGrid
              products={products}
              refreshControl={refreshControl}
              loadMore={loadMore}
              hasMore={!!hasNextPage}
              isLoadingMore={isFetchingNextPage}
            />
          ) : (
            <Text style={styles.emptyMessage}>{t("no-products-found")}</Text>
          )}
        </>
      )}

      {isFocused && searchQuery.length === 0 && (
        <RecentSearches
          recentSearches={recentSearches}
          isLoading={recentSearchesLoading}
          onClickRecentSearch={handleClickRecentSearch}
          onDeleteRecentSearch={handleDeleteRecentSearch}
          onClearAllRecentSearches={handleClearAllRecentSearches}
          clearingAllRecentSearches={deleteAllRecentSearchesMutation.isLoading}
          loadMore={loadMoreRecentSearches}
          hasMore={!!hasNextRecentSearchesPage}
          isLoadingMore={isFetchingNextRecentSearchesPage}
        />
      )}

      {isFocused && searchQuery.length > 0 && (
        <>
          {productsLoading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : products.length > 0 ? (
            <SearchResults
              products={products}
              onClickSearchedProduct={handleClickSearchedProduct}
              loadMore={loadMore}
              hasMore={!!hasNextPage}
              isLoadingMore={isFetchingNextPage}
            />
          ) : (
            <Text style={styles.emptyMessage}>
              {t("no-results-found-for")} "{searchQuery}"
            </Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  emptyMessage: {
    textAlign: "left",
    marginTop: 20,
    marginLeft: 10,
    fontSize: 16,
    color: colors.secondary,
    fontWeight: "bold",
  },
});

export default SearchScreen;
