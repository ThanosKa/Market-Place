import React, { useState, useMemo, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Product, GetProductsParams } from "../../interfaces/product";
import ProductCard from "../ProductCard/productCard";
import { BASE_URL } from "../../services/axiosConfig";
import { getProducts } from "../../services/product";
import { toggleLikeProduct } from "../../services/likes";
import { getLoggedUser } from "../../services/user";

interface ProductGridProps {
  onRefreshComplete: () => void;
  selectedCategories: string[];
}

const ProductGrid: React.FC<ProductGridProps> = ({
  onRefreshComplete,
  selectedCategories,
}) => {
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [disabledButtons, setDisabledButtons] = useState<string[]>([]);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const queryParams: GetProductsParams = useMemo(() => {
    const params: GetProductsParams = {};
    if (selectedCategories.length > 0) {
      params.category = selectedCategories;
    }
    return params;
  }, [selectedCategories]);

  const { data: userData, isLoading: userLoading } = useQuery(
    "loggedUser",
    getLoggedUser
  );
  const { data, isLoading, error } = useQuery(
    ["products", queryParams],
    () => getProducts(queryParams),
    {
      onSettled: onRefreshComplete,
    }
  );

  useEffect(() => {
    if (userData?.data?.user?.likedProducts) {
      setLikedProducts(
        userData.data.user.likedProducts.map((p: Product) => p._id)
      );
    }
  }, [userData]);

  const toggleLikeMutation = useMutation(toggleLikeProduct, {
    onMutate: (productId) => {
      setDisabledButtons((prev) => [...prev, productId]);
      setLikedProducts((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
    },
    onSettled: (data, error, productId) => {
      setDisabledButtons((prev) => prev.filter((id) => id !== productId));
      if (error) {
        setLikedProducts((prev) =>
          prev.includes(productId)
            ? prev.filter((id) => id !== productId)
            : [...prev, productId]
        );
      }
      queryClient.invalidateQueries("loggedInUser");
      queryClient.invalidateQueries(["products", queryParams]);
    },
  });

  if (isLoading || userLoading) {
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
    toggleLikeMutation.mutate(productId);
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
      condition={t(item.condition)}
      isLiked={likedProducts.includes(item._id)}
      onLikeToggle={() => toggleLike(item._id)}
      isDisabled={disabledButtons.includes(item._id)}
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
