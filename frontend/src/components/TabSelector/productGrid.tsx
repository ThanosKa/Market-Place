// components/ProductGrid.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import ProductItem from "./productItem";
import { Product } from "../../interfaces/product";
import { useMutation, useQueryClient } from "react-query";
import { toggleLikeProduct } from "../../services/likes";

type Props = {
  products: Product[];
};

const ProductGrid: React.FC<Props> = ({ products }) => {
  const queryClient = useQueryClient();

  const toggleLikeMutation = useMutation(toggleLikeProduct, {
    onSettled: () => {
      queryClient.invalidateQueries("loggedUser");
    },
  });

  const handleLikeToggle = async (productId: string) => {
    await toggleLikeMutation.mutateAsync(productId);
  };

  return (
    <ScrollView>
      <View style={styles.productsGrid}>
        {products.length > 0 ? (
          products.map((product) => (
            <ProductItem
              key={product._id}
              product={product}
              onLikeToggle={handleLikeToggle}
            />
          ))
        ) : (
          <Text>No products found</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
});

export default ProductGrid;
