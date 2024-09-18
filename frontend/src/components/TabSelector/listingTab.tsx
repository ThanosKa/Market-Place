import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../colors/colors";
import ProductGrid from "../Product/productGrid";
import { Product } from "../../interfaces/product";

type Props = {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLayout: (event: LayoutChangeEvent) => void;
};

const ListingsTab: React.FC<Props> = ({
  products,
  searchQuery,
  setSearchQuery,
  onSearch,
  isLoading,
  loadMore,
  hasMore,
  isLoadingMore,
  onLayout,
}) => {
  const { t } = useTranslation();

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch();
  };

  return (
    <View style={styles.listingsContainer} onLayout={onLayout}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={24}
          color={colors.primary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search-this-profile")}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.secondary} />
        </View>
      ) : (
        <>
          <ProductGrid products={products} />
          {isLoadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={colors.secondary} />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listingsContainer: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingMoreContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
});

export default ListingsTab;
