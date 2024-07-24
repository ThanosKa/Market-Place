import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
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
};

const ListingsTab: React.FC<Props> = ({
  products,
  searchQuery,
  setSearchQuery,
  onSearch,
  isLoading,
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
    <View style={styles.listingsContainer}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={24}
          color={colors.primary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("Search this profile")}
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
        <ProductGrid products={products} />
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
  },
});

export default ListingsTab;
