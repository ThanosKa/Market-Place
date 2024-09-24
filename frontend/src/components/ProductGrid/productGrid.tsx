import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import {
  Product,
  ProductsResponse,
  GetProductsParams,
} from "../../interfaces/product";
import ProductCard from "../ProductCard/productCard";
import { getProducts } from "../../services/product";
import { getLikedProducts, toggleLikeProduct } from "../../services/likes";
import { colors } from "../../colors/colors";
import { Filters } from "../../pages/home/home";
import FlexibleSkeleton from "../Skeleton/FlexibleSkeleton";

interface ProductGridProps {
  onRefreshComplete: () => void;
  selectedCategories: string[];
  filters: Filters;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  onRefreshComplete,
  selectedCategories,
  filters,
}) => {
  const [localLikedProducts, setLocalLikedProducts] = useState<Set<string>>(
    new Set()
  );
  const [disabledButtons, setDisabledButtons] = useState<Set<string>>(
    new Set()
  );
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const queryParams: GetProductsParams = useMemo(() => {
    const params: GetProductsParams = {
      page: 1,
      limit: 10,
    };

    if (filters.sort) {
      params.sort = filters.sort;
    }

    if (filters.order) {
      params.order = filters.order;
    }

    if (filters.minPrice) {
      params.minPrice = filters.minPrice;
    }

    if (filters.maxPrice) {
      params.maxPrice = filters.maxPrice;
    }

    if (filters.conditions && filters.conditions.length > 0) {
      params.condition = filters.conditions;
    }

    if (selectedCategories.length > 0) {
      params.category = selectedCategories;
    }

    return params;
  }, [selectedCategories, filters]);

  const { data: userLikedProducts, isLoading: likedProductsLoading } = useQuery<
    Product[]
  >("likedProducts", getLikedProducts, {
    onSuccess: (data) => {
      setLocalLikedProducts(new Set(data.map((product) => product._id)));
    },
  });

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
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

  const toggleLikeMutation = useMutation(toggleLikeProduct, {
    onMutate: (productId) => {
      setDisabledButtons((prev) => new Set(prev).add(productId));
      setLocalLikedProducts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(productId)) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });
    },
    onSettled: (data, error, productId) => {
      setDisabledButtons((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      if (error) {
        setLocalLikedProducts((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(productId)) {
            newSet.delete(productId);
          } else {
            newSet.add(productId);
          }
          return newSet;
        });
      }
      queryClient.invalidateQueries("likedProducts");
      queryClient.invalidateQueries(["products", queryParams]);
    },
  });

  const toggleLike = useCallback(
    (productId: string) => {
      toggleLikeMutation.mutate(productId);
    },
    [toggleLikeMutation]
  );

  const renderProduct = ({ item: product }: { item: Product }) => (
    <View style={styles.productWrapper}>
      <ProductCard
        key={product._id}
        userImage={
          product.seller.profilePicture
            ? `${product.seller.profilePicture}`
            : null
        }
        userName={`${product.seller.firstName} ${product.seller.lastName}`}
        userId={product.seller._id}
        productImage={product.images.length > 0 ? `${product.images[0]}` : null}
        title={product.title}
        price={`$${product.price}`}
        condition={t(product.condition)}
        isLiked={localLikedProducts.has(product._id)}
        onLikeToggle={() => toggleLike(product._id)}
        isDisabled={disabledButtons.has(product._id)}
        productId={product._id}
      />
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading || likedProductsLoading) {
    return (
      <View>
        <Text style={styles.containerLoading}>{t("your-daily-picks")}</Text>
        <FlexibleSkeleton
          type="grid"
          itemCount={4}
          columns={2}
          hasProfileImage={true}
          profileImagePosition="top"
          contentLines={3}
        />
      </View>
    );
  }

  if (error) {
    return <Text>{t("errorLoadingData")}</Text>;
  }

  const products = data?.pages.flatMap((page) => page.data.products) || [];

  if (products.length === 0) {
    return <Text style={styles.noProductsText}>{t("no-products-found")}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("your-daily-picks")}</Text>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  containerLoading: {
    padding: 10,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  gridContainer: {
    paddingBottom: 20,
  },
  productWrapper: {
    width: "48%",
    marginBottom: 10,
    marginHorizontal: "1%",
  },
  noProductsText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default ProductGrid;
