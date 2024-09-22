import React from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Product } from "../../interfaces/product";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { BASE_URL } from "../../services/axiosConfig";
import { getSoldProducts } from "../../services/product";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { colors } from "../../colors/colors";
import SharedProductList from "../../components/SharedProductList";

const SalesScreen: React.FC = () => {
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
    "soldProducts",
    ({ pageParam = 1 }) => getSoldProducts(pageParam),
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

  const handleBuyerPress = (
    buyer:
      | {
          _id: string;
          firstName?: string;
          lastName?: string;
          profilePicture?: string;
        }
      | null
      | undefined
  ) => {
    if (buyer) {
      navigation.navigate("UserProfile", {
        userId: buyer._id,
        firstName: buyer.firstName,
        lastName: buyer.lastName,
      });
    }
  };

  const renderBuyerInfo = (item: Product) => (
    <>
      <Text style={styles.toText}>{t("buyer")}:</Text>
      {item.sold && item.sold.to && (
        <TouchableOpacity
          style={styles.buyerInfo}
          onPress={() => handleBuyerPress(item.sold?.to)}
        >
          {item.sold.to.profilePicture ? (
            <Image
              source={{ uri: `${item.sold.to.profilePicture}` }}
              style={styles.buyerImage}
            />
          ) : (
            <View style={styles.buyerImage}>
              <UndefProfPicture size={40} iconSize={20} />
            </View>
          )}
          <Text style={styles.buyerName} numberOfLines={1}>
            {item.sold.to.firstName} {item.sold.to.lastName}
          </Text>
        </TouchableOpacity>
      )}
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
      renderUserInfo={renderBuyerInfo}
      emptyMessage={t("noSoldProducts")}
      title={t("sales")}
      dateLabel="date-sold"
    />
  );
};

const styles = StyleSheet.create({
  toText: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 4,
  },
  buyerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 5,
  },
  buyerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  buyerName: {
    fontSize: 14,
    color: colors.primary,
    flex: 1,
  },
});

export default SalesScreen;
