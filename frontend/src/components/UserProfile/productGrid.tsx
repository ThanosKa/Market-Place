import React, { useState } from "react";
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
  const [disabledButtons, setDisabledButtons] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const toggleLikeMutation = useMutation(toggleLikeProduct, {
    onMutate: (productId) => {
      setDisabledButtons((prev) => [...prev, productId]);
    },
    onSettled: (data, error, productId) => {
      setDisabledButtons((prev) => prev.filter((id) => id !== productId));
      queryClient.invalidateQueries("loggedUser");
    },
  });

  const handleLikeToggle = (productId: string) => {
    toggleLikeMutation.mutate(productId);
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
              isDisabled={disabledButtons.includes(product._id)}
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
