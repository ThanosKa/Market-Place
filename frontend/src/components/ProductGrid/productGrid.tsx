// components/ProductGrid/productGrid.tsx
import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Product, GetProductsParams } from "../../interfaces/product";
import ProductCard from "../ProductCard/productCard";
import { BASE_URL } from "../../services/axiosConfig";
import { getProducts } from "../../services/product";

interface ProductGridProps {
  onRefreshComplete: () => void;
  selectedCategories: string[];
}

const ProductGrid: React.FC<ProductGridProps> = ({
  onRefreshComplete,
  selectedCategories,
}) => {
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const { t } = useTranslation();

  const queryParams: GetProductsParams = useMemo(() => {
    const params: GetProductsParams = {};
    if (selectedCategories.length > 0) {
      params.category = selectedCategories;
    }
    return params;
  }, [selectedCategories]);

  const { data, isLoading, error } = useQuery(
    ["products", queryParams],
    () => getProducts(queryParams),
    {
      onSettled: onRefreshComplete,
    }
  );

  if (isLoading) {
    return <ActivityIndicator size="small" />;
  }

  if (error) {
    return <Text>{t("error-fetching-products")}</Text>;
  }

  const products = data?.data.products || [];

  if (products.length === 0) {
    return <Text style={styles.noProductsText}>{t("no-products-found")}</Text>;
  }
  const toggleLike = (productId: string) => {
    setLikedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };
  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      key={item._id}
      userImage={`${BASE_URL}/${item.seller.profilePicture}`}
      userName={`${item.seller.firstName} ${item.seller.lastName}`}
      userId={item.seller._id}
      productImage={
        item.images.length > 0 ? `${BASE_URL}${item.images[0]}` : null
      }
      title={item.title}
      price={`$${item.price}`}
      condition={item.condition}
      isLiked={likedProducts.includes(item._id)}
      onLikeToggle={() => toggleLike(item._id)}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("your-daily-picks")}</Text>
      <View style={styles.gridContainer}>
        {products.map((product) => (
          <View key={product._id} style={styles.productWrapper}>
            {renderProduct({ item: product })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productWrapper: {
    width: "48%",
    marginBottom: 10,
  },
  noProductsText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default ProductGrid;
