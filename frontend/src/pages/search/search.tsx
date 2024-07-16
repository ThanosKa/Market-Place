import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import debounce from "lodash.debounce";
import { colors } from "../../colors/colors";
import SearchBar from "../../components/SearchBarComponenet";
import { getProducts } from "../../services/product";
import {
  getRecentSearches,
  addRecentSearch,
  deleteRecentSearch,
  deleteAllRecentSearches,
} from "../../services/recentSearch";
import SearchResults from "./helpers/SearchResults";
import RecentSearches from "./helpers/RecentSearches";
import ProductGrid from "./helpers/ProductGrid";
import SearchButton from "./helpers/SearchButton";
import { RouteProp, useRoute } from "@react-navigation/native";
import { MainStackParamList } from "../../interfaces/auth/navigation";

type SearchScreenRouteProp = RouteProp<MainStackParamList, "Search">;

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const route = useRoute<SearchScreenRouteProp>();

  useEffect(() => {
    if (route.params?.refreshSearch) {
      onRefresh();
    }
  }, [route.params?.refreshSearch]);

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

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setDebouncedSearchQuery(text);
    }, 300),
    []
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery(["products", debouncedSearchQuery], () => getProducts(), {
    enabled: !isFocused || (isFocused && debouncedSearchQuery.length > 0),
  });

  const {
    data: recentSearchesData,
    isLoading: recentSearchesLoading,
    error: recentSearchesError,
    refetch: refetchRecentSearches,
  } = useQuery("recentSearches", getRecentSearches, {
    enabled: isFocused && searchQuery.length === 0,
  });

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
      queryClient.invalidateQueries("recentSearches");
    },
  });

  const products = productsData?.data.products || [];
  const recentSearches = recentSearchesData?.data.recentSearches || [];

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
    setIsLoading(true);
    Promise.all([refetchProducts(), refetchRecentSearches()]).then(() => {
      setRefreshing(false);
      setIsLoading(false);
    });
  }, [refetchProducts, refetchRecentSearches]);
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
            <ProductGrid products={products} refreshControl={refreshControl} />
          ) : (
            <Text style={styles.emptyMessage}>{t("no-products-found")}</Text>
          )}
        </>
      )}

      {isFocused && searchQuery.length === 0 && (
        <RecentSearches
          recentSearches={recentSearches}
          isLoading={recentSearchesLoading || isLoading}
          onClickRecentSearch={handleClickRecentSearch}
          onDeleteRecentSearch={handleDeleteRecentSearch}
          onClearAllRecentSearches={handleClearAllRecentSearches}
        />
      )}

      {isFocused && searchQuery.length > 0 && (
        <>
          {productsLoading || isLoading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : products.length > 0 ? (
            <SearchResults
              products={products}
              onClickSearchedProduct={handleClickSearchedProduct}
            />
          ) : (
            <Text style={styles.emptyMessage}>{t("no-products-found")}</Text>
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
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: colors.secondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchScreen;
