// components/ProductGrid.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import ProductItem from "./productItem";
import { Product } from "../../interfaces/product";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { toggleLikeProduct, getLikedProducts } from "../../services/likes";
import { colors } from "../../colors/colors";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { useNavigation } from "@react-navigation/native";

type Props = {
  products: Product[];
};

const ProductGrid: React.FC<Props> = ({ products }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: likedProducts } = useQuery("likedProducts", getLikedProducts);

  const toggleLikeMutation = useMutation(toggleLikeProduct, {
    onSettled: () => {
      queryClient.invalidateQueries("likedProducts");
    },
  });

  const handleLikeToggle = async (productId: string) => {
    await toggleLikeMutation.mutateAsync(productId);
  };

  // Create a Set of liked product IDs for efficient lookup
  const likedProductIds = new Set(likedProducts?.map((p) => p._id) || []);

  return (
    <ScrollView>
      <View style={styles.productsGrid}>
        {products.length > 0 ? (
          products.map((product) => (
            <ProductItem
              key={product._id}
              product={product}
              onLikeToggle={handleLikeToggle}
              isLiked={likedProductIds.has(product._id)}
              productId={product._id}
            />
          ))
        ) : (
          <View style={styles.noProductsContainer}>
            <Text style={styles.noProductsText}>{t("no-products-found")}</Text>
          </View>
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
  noProductsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noProductsText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
  },
});

export default ProductGrid;
