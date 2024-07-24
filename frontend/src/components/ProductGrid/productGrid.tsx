import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import {
  Product,
  ProductsResponse,
  GetProductsParams,
} from "../../interfaces/product";
import ProductCard from "../ProductCard/productCard";
import { BASE_URL } from "../../services/axiosConfig";
import { getProducts } from "../../services/product";
import { toggleLikeProduct } from "../../services/likes";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { colors } from "../../colors/colors";

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
    const params: GetProductsParams = { limit: 10 };
    if (selectedCategories.length > 0) {
      params.category = selectedCategories;
    }
    return params;
  }, [selectedCategories]);

  const { data: userData, isLoading: userLoading } = useLoggedUser();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ProductsResponse, Error>(
    ["products", queryParams],
    ({ pageParam = 1 }) => getProducts({ ...queryParams, page: pageParam }),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.data.page * lastPage.data.limit < lastPage.data.total) {
          return lastPage.data.page + 1;
        }
        return undefined;
      },
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

  const products = data?.pages.flatMap((page) => page.data.products) || [];

  if (products.length === 0) {
    return <Text style={styles.noProductsText}>{t("no-products-found")}</Text>;
  }

  const toggleLike = (productId: string) => {
    toggleLikeMutation.mutate(productId);
  };

  const renderProduct = (product: Product) => (
    <ProductCard
      key={product._id}
      userImage={
        product.seller.profilePicture
          ? `${BASE_URL}/${product.seller.profilePicture}`
          : null
      }
      userName={`${product.seller.firstName} ${product.seller.lastName}`}
      userId={product.seller._id}
      productImage={
        product.images.length > 0 ? `${BASE_URL}${product.images[0]}` : null
      }
      title={product.title}
      price={`$${product.price}`}
      condition={t(product.condition)}
      isLiked={likedProducts.includes(product._id)}
      onLikeToggle={() => toggleLike(product._id)}
      isDisabled={disabledButtons.includes(product._id)}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("your-daily-picks")}</Text>
      <View style={styles.gridContainer}>
        {products.map((product) => (
          <View key={product._id} style={styles.productWrapper}>
            {renderProduct(product)}
          </View>
        ))}
      </View>
      {hasNextPage && (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          <View style={styles.loadMoreContent}>
            {isFetchingNextPage ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : (
              <Text style={styles.loadMoreText}>{t("load-more")}</Text>
            )}
          </View>
        </TouchableOpacity>
      )}
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
  loadMoreButton: {
    alignItems: "center",
    justifyContent: "center",
    // padding: 10,
    // marginTop: 10,
  },
  loadMoreContent: {
    paddingBottom: 30,
  },
  loadMoreText: {
    color: colors.secondary,
    fontSize: 16,
  },
});

export default ProductGrid;
