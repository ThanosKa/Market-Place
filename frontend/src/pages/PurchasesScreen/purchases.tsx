import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Product } from "../../interfaces/product";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { BASE_URL } from "../../services/axiosConfig";
import { colors } from "../../colors/colors";
import { getPurchasedProducts } from "../../services/product";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";

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

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <TouchableOpacity onPress={() => handleProductPress(item._id)}>
        <Image
          source={{ uri: `${BASE_URL}${item.images[0]}` }}
          style={styles.productImage}
        />
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={styles.purchaseInfo}>
          <Text style={styles.purchaseDate}>
            {/* {t("from")} */}
            <Text style={styles.dateBought}>{t("date-bought")} </Text>
            <Text style={styles.date}>
              {" "}
              {new Date(item.sold?.date || "").toLocaleDateString()}{" "}
            </Text>
          </Text>
        </View>
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
        <Text style={styles.purchaseDate}>
          {new Date(item.sold?.date || "").toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = async () => {
    // Refetch only the first page
    await refetch({ refetchPage: (_, index) => index === 0 });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t("errorLoadingData")}</Text>
      </View>
    );
  }

  const allProducts = data?.pages?.flatMap((page) => page.data.products) || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("purchases")}</Text>
      {allProducts.length > 0 ? (
        <FlatList
          key="two-column-list"
          data={allProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
            />
          }
        />
      ) : (
        <Text style={styles.emptyMessage}>{t("noPurchasedProducts")}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.primary,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productItem: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: colors.primary,
  },
  productPrice: {
    fontSize: 16,
    color: colors.primary,
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
  purchaseDate: {
    fontSize: 10,
    color: colors.lightGray,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,

    alignItems: "center",
  },
  errorText: {
    color: colors.primary,
    fontSize: 16,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    color: colors.secondary,
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  footerLoader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  fromText: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 4,
  },
  dateBought: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 4,
  },
  purchaseInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
});

export default PurchasesScreen;
