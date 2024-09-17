import React from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Product } from "../../interfaces/product";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { BASE_URL } from "../../services/axiosConfig";
import { getPurchasedProducts } from "../../services/product";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { colors } from "../../colors/colors";
import SharedProductList from "../../components/SharedProductList";

const PurchasesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery(
    "purchasedProducts",
    ({ pageParam = 1 }) => getPurchasedProducts(pageParam),
    {
      getNextPageParam: (lastPage) =>
        lastPage.data.page < lastPage.data.totalPages
          ? lastPage.data.page + 1
          : undefined,
    }
  );

  const handleProductPress = (productId: string) => {
    navigation.navigate("Product", { productId });
  };

  const handleSellerPress = (seller: {
    _id: string;
    firstName?: string;
    lastName?: string;
  }) => {
    navigation.navigate("UserProfile", {
      userId: seller._id,
      firstName: seller.firstName,
      lastName: seller.lastName,
    });
  };

  const renderSellerInfo = (item: Product) => (
    <>
      <Text style={styles.fromText}>{t("from")}</Text>
      <TouchableOpacity
        style={styles.sellerInfo}
        onPress={() => handleSellerPress(item.seller)}
      >
        {item.seller.profilePicture ? (
          <Image
            source={{ uri: `${BASE_URL}/${item.seller.profilePicture}` }}
            style={styles.sellerImage}
          />
        ) : (
          <View style={styles.sellerImage}>
            <UndefProfPicture size={40} iconSize={20} />
          </View>
        )}
        <Text style={styles.sellerName} numberOfLines={1}>
          {item.seller.firstName} {item.seller.lastName}
        </Text>
      </TouchableOpacity>
    </>
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = async () => {
    await refetch({ refetchPage: (_, index) => index === 0 });
  };

  const allProducts = data?.pages?.flatMap((page) => page.data.products) || [];
  if (!data) {
    return (
      <View style={styles.container}>
        <Text> {t("errorLoadingData")}</Text>
      </View>
    );
  }
  return (
    <SharedProductList
      products={allProducts}
      isLoading={isLoading}
      error={error}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      isRefetching={isRefetching}
      onLoadMore={handleLoadMore}
      onRefresh={handleRefresh}
      onProductPress={handleProductPress}
      renderUserInfo={renderSellerInfo}
      emptyMessage={t("noPurchasedProducts")}
      title={t("purchases")}
      dateLabel="date-bought"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  fromText: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 4,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 5,
  },
  sellerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  sellerName: {
    fontSize: 14,
    color: colors.primary,
    flex: 1,
  },
});

export default PurchasesScreen;
