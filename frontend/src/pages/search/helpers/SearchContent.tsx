// SearchContent.tsx
import React from "react";
import {
  View,
  ActivityIndicator,
  Text,
  ScrollView,
  RefreshControl,
  FlatList,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import UserListItem from "./UserListItem";
import { colors } from "../../../colors/colors";
import SearchResults from "./SearchResults";
import RecentSearches from "./RecentSearches";
import ProductGrid from "./ProductGrid";
import FlexibleSkeleton from "../../../components/Skeleton/FlexibleSkeleton";
import { RecentSearch } from "../../../interfaces/recentSearch";

interface SearchContentProps {
  isFocused: boolean;
  searchQuery: string;
  showTabs: boolean;
  activeTab: "products" | "users";
  isSearching: boolean;
  products: any[];
  users: any[];
  recentSearches: any[];
  productsLoading: boolean;
  usersLoading: boolean;
  recentSearchesLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  handleClickSearchedProduct: (productId: string) => void;
  handleClickRecentSearch: (search: RecentSearch) => void;
  handleUserPress: (userId: string) => void;
  deleteRecentSearch: (id: string) => void;
  deleteAllRecentSearches: () => void;
  loadMoreProducts: () => void;
  loadMoreUsers: () => void;
  loadMoreRecentSearches: () => void;
  hasMoreProducts: boolean;
  hasMoreUsers: boolean;
  hasMoreRecentSearches: boolean;
  isLoadingMoreProducts: boolean;
  isLoadingMoreUsers: boolean;
  isLoadingMoreRecentSearches: boolean;
  isDeletingAllRecentSearches: boolean;
}

const SearchContent: React.FC<SearchContentProps> = ({
  isFocused,
  searchQuery,
  showTabs,
  activeTab,
  isSearching,
  products,
  users,
  recentSearches,
  productsLoading,
  usersLoading,
  recentSearchesLoading,
  refreshing,
  onRefresh,
  handleClickSearchedProduct,
  handleClickRecentSearch,
  handleUserPress,
  deleteRecentSearch,
  deleteAllRecentSearches,
  loadMoreProducts,
  loadMoreUsers,
  loadMoreRecentSearches,
  hasMoreProducts,
  hasMoreUsers,
  hasMoreRecentSearches,
  isLoadingMoreProducts,
  isLoadingMoreUsers,
  isLoadingMoreRecentSearches,
  isDeletingAllRecentSearches,
}) => {
  const { t } = useTranslation();

  if (isFocused && searchQuery.length === 0) {
    return (
      <RecentSearches
        recentSearches={recentSearches}
        isLoading={recentSearchesLoading}
        onClickRecentSearch={handleClickRecentSearch}
        onDeleteRecentSearch={deleteRecentSearch}
        onClearAllRecentSearches={deleteAllRecentSearches}
        clearingAllRecentSearches={isDeletingAllRecentSearches}
        loadMore={loadMoreRecentSearches}
        hasMore={hasMoreRecentSearches}
        isLoadingMore={isLoadingMoreRecentSearches}
      />
    );
  }

  if (isFocused && searchQuery.length > 0) {
    if (showTabs) {
      if (activeTab === "products") {
        return productsLoading ? (
          <ActivityIndicator size="small" color={colors.secondary} />
        ) : products.length > 0 ? (
          <SearchResults
            products={products}
            onClickSearchedProduct={handleClickSearchedProduct}
            loadMore={loadMoreProducts}
            hasMore={hasMoreProducts}
            isLoadingMore={isLoadingMoreProducts}
          />
        ) : (
          <Text style={styles.emptyMessage}>{t("no-products-found")}</Text>
        );
      } else {
        return (
          <FlatList
            data={users}
            renderItem={({ item }) =>
              item ? (
                <UserListItem
                  user={item}
                  onPress={() => handleUserPress(item.id)}
                />
              ) : null
            }
            keyExtractor={(item) => item?.id ?? Math.random().toString()}
            onEndReached={loadMoreUsers}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              usersLoading ? (
                <ActivityIndicator size="small" color={colors.secondary} />
              ) : (
                <Text style={styles.emptyMessage}>{t("no-users-found")}</Text>
              )
            }
          />
        );
      }
    } else {
      if (isSearching || productsLoading) {
        return (
          <ScrollView>
            <FlexibleSkeleton
              type="search"
              itemCount={10}
              hasProfileImage={true}
              profileImagePosition="left"
              contentLines={1}
            />
          </ScrollView>
        );
      }

      return products.length > 0 ? (
        <SearchResults
          products={products}
          onClickSearchedProduct={handleClickSearchedProduct}
          loadMore={loadMoreProducts}
          hasMore={hasMoreProducts}
          isLoadingMore={isLoadingMoreProducts}
        />
      ) : (
        <Text style={styles.emptyMessage}>
          {t("no-results-found-for")} "{searchQuery}"
        </Text>
      );
    }
  }

  if (!isFocused) {
    return productsLoading ? (
      <ActivityIndicator size="small" color={colors.secondary} />
    ) : (
      <ProductGrid
        products={products}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        loadMore={loadMoreProducts}
        hasMore={hasMoreProducts}
        isLoadingMore={isLoadingMoreProducts}
      />
    );
  }

  return null;
};

const styles = StyleSheet.create({
  emptyMessage: {
    textAlign: "left",
    marginTop: 20,
    marginLeft: 10,
    fontSize: 16,
    color: colors.secondary,
    fontWeight: "bold",
  },
});

export default SearchContent;
