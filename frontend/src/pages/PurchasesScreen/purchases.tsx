import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Product } from "../../interfaces/product";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { BASE_URL } from "../../services/axiosConfig";
import { colors } from "../../colors/colors";
import { getPurchasedProducts } from "../../services/product";

const PurchasesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  const { data, isLoading, error } = useQuery(
    "purchasedProducts",
    getPurchasedProducts
  );

  const handleProductPress = (productId: string) => {
    navigation.navigate("Product", { productId });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleProductPress(item._id)}
    >
      <Image
        source={{ uri: `${BASE_URL}${item.images[0]}` }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={styles.sellerInfo}>
          <Image
            source={{ uri: `${BASE_URL}/${item.seller.profilePicture}` }}
            style={styles.sellerImage}
          />
          <Text style={styles.sellerName} numberOfLines={1}>
            {item.seller.firstName} {item.seller.lastName}
          </Text>
        </View>
        <Text style={styles.purchaseDate}>
          {new Date(item.sold?.date || "").toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t("errorFetchingPurchases")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("purchases")}</Text>
      {data && data.data.products.length > 0 ? (
        <FlatList
          key="two-column-list"
          data={data.data.products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.listContent}
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
    fontWeight: "bold",
    marginBottom: 4,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sellerImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  sellerName: {
    fontSize: 12,
    color: colors.secondary,
    flex: 1,
  },
  purchaseDate: {
    fontSize: 10,
    color: colors.lightGray,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
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
});

export default PurchasesScreen;
