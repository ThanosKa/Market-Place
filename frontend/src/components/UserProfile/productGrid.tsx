// components/ProductGrid.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import ProductItem from "./productItem";
import { Product } from "../../interfaces/product";

type Props = {
  products: Product[];
};

const ProductGrid: React.FC<Props> = ({ products }) => (
  <View style={styles.productsGrid}>
    {products.map((product) => (
      <ProductItem key={product._id} product={product} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default ProductGrid;
