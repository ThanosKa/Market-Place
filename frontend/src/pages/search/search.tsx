// SearchScreen.tsx
// SearchScreen.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Keyboard,
  Text,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { colors } from "../../colors/colors";
import SearchBar from "../../components/SearchBarComponenet";
import { Product, GetProductsParams } from "../../interfaces/product";
import { getProducts } from "../../services/product";
import { BASE_URL } from "../../services/axiosConfig";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery(
    ["products", searchQuery],
    () => getProducts({ search: searchQuery }),
    {
      enabled: true,
    }
  );

  const products = data?.data.products || [];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const cancelSearch = () => {
    setSearchQuery("");
    setIsFocused(false);
    Keyboard.dismiss();
  };

  const renderProductGrid = ({ item }: { item: Product }) => (
    <View style={styles.gridItemContainer}>
      <Image
        source={{
          uri:
            item.images.length > 0 ? `${BASE_URL}${item.images[0]}` : undefined,
        }}
        style={styles.gridImage}
      />
    </View>
  );

  const renderSearchResult = ({ item }: { item: Product }) => (
    <View style={styles.searchResultItem}>
      <Image
        source={{
          uri:
            item.images.length > 0 ? `${BASE_URL}${item.images[0]}` : undefined,
        }}
        style={styles.resultImage}
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultOwner}>
          {`${item.seller.firstName} ${item.seller.lastName}`}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  if (error) {
    return <Text>{t("error-fetching-products")}</Text>;
  }

  return (
    <View style={styles.container}>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        clearSearch={clearSearch}
        cancelSearch={cancelSearch}
      />

      {!isFocused && searchQuery.length === 0 && (
        <FlatList
          data={products}
          renderItem={renderProductGrid}
          keyExtractor={(item) => item._id}
          numColumns={3}
          style={styles.productGrid}
          key="grid"
        />
      )}

      {(isFocused || searchQuery.length > 0) && (
        <FlatList
          data={products}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item._id}
          style={styles.searchResults}
          key="list"
        />
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
  productGrid: {
    flex: 1,
  },
  gridItemContainer: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 0.5,
    backgroundColor: "#fff",
  },
  gridImage: {
    flex: 1,
    backgroundColor: "#e0e0e0",
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultOwner: {
    fontSize: 14,
    color: "#666",
  },
});

export default SearchScreen;
