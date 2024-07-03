// ProductGrid.tsx
import React from "react";
import { FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Product } from "../../../interfaces/product";
import { BASE_URL } from "../../../services/axiosConfig";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const handleClickProduct = (product: Product) => {
    console.log("Product clicked:", product._id);
  };

  const renderProductGrid = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.gridItemContainer}
      onPress={() => handleClickProduct(item)}
    >
      <Image
        source={{
          uri:
            item.images.length > 0 ? `${BASE_URL}${item.images[0]}` : undefined,
        }}
        style={styles.gridImage}
      />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderProductGrid}
      keyExtractor={(item) => item._id}
      numColumns={3}
      style={styles.productGrid}
    />
  );
};

const styles = StyleSheet.create({
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
});

export default ProductGrid;
