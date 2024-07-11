import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../colors/colors";
import ProductGrid from "../UserProfile/productGrid";
import { Product } from "../../interfaces/product";

type Props = {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const ListingsTab: React.FC<Props> = ({
  products,
  searchQuery,
  setSearchQuery,
}) => {
  const { t } = useTranslation();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, products]);

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
          onChangeText={setSearchQuery}
        />
      </View>
      <ProductGrid products={filteredProducts} />
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
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});

export default ListingsTab;
