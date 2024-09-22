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
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Product } from "../../interfaces/product";
import { BASE_URL } from "../../services/axiosConfig";
import { colors } from "../../colors/colors";
import FlexibleSkeleton from "../Skeleton/FlexibleSkeleton";

interface SharedProductListProps {
  products: Product[];
  isLoading: boolean;
  error: unknown;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  isRefetching: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onProductPress: (productId: string) => void;
  renderUserInfo: (item: Product) => React.ReactNode;
  emptyMessage: string;
  title: string;
  dateLabel: string;
}

const SharedProductList: React.FC<SharedProductListProps> = ({
  products,
  isLoading,
  error,
  isFetchingNextPage,
  hasNextPage,
  isRefetching,
  onLoadMore,
  onRefresh,
  onProductPress,
  renderUserInfo,
  emptyMessage,
  title,
  dateLabel,
}) => {
  const { t } = useTranslation();

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <TouchableOpacity onPress={() => onProductPress(item._id)}>
        <Image
          source={{ uri: `${item.images[0]}` }}
          style={styles.productImage}
        />
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDate}>
            <Text style={styles.dateLabel}>{t(dateLabel)} </Text>
            <Text style={styles.date}>
              {new Date(item.sold?.date || "").toLocaleDateString()}
            </Text>
          </Text>
        </View>
        {renderUserInfo(item)}
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

  if (error && !isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t("errorLoadingData")}</Text>
      </View>
    );
  }
  return (
    <View style={isLoading ? styles.containerLoading : styles.container}>
      <Text style={styles.title}>{title}</Text>
      {isLoading ? (
        <FlexibleSkeleton
          type="grid"
          itemCount={6}
          columns={2}
          hasProfileImage={true}
          profileImagePosition="bottom"
          contentLines={3}
        />
      ) : (
        <>
          {products.length > 0 ? (
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.listContent}
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={onRefresh}
                />
              }
            />
          ) : (
            <Text style={styles.emptyMessage}>{emptyMessage}</Text>
          )}
        </>
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
  containerLoading: {
    flex: 1,
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
  transactionDate: {
    fontSize: 10,
    color: colors.lightGray,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
    alignItems: "center",
  },
  centeredLoading: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
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
  dateLabel: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 4,
  },
  transactionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
});

export default SharedProductList;
