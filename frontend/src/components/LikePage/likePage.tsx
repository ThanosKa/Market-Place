import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "../../colors/colors";
import Header from "../UserProfile/header";
import { RouteProp } from "@react-navigation/native";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import TabSelector from "../TabSelector/tabSelector";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Product } from "../../interfaces/product";
import { useTranslation } from "react-i18next";
import { BASE_URL } from "../../services/axiosConfig";
import { toggleLikeProduct, toggleLikeUser } from "../../services/likes";
import { getLoggedUser } from "../../services/user";
import { LikedUser } from "../../interfaces/user";

type LikesPageProp = RouteProp<MainStackParamList, "Likes">;
type LikesPagePropScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Likes"
>;
type Props = {
  route: LikesPageProp;
  navigation: LikesPagePropScreenNavigationProp;
};

const LikesPage: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "liked-products" | "liked-profiles"
  >("liked-products");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useQuery("loggedUser", getLoggedUser);

  const toggleUserLikeMutation = useMutation(toggleLikeUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("loggedUser");
    },
  });

  const toggleProductLikeMutation = useMutation(toggleLikeProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries("loggedUser");
    },
  });

  const handleToggleProductLike = useCallback(
    (productId: string) => {
      // Optimistic update
      queryClient.setQueryData("loggedUser", (oldData: any) => ({
        ...oldData,
        data: {
          ...oldData.data,
          user: {
            ...oldData.data.user,
            likedProducts: oldData.data.user.likedProducts.filter(
              (p: Product) => p._id !== productId
            ),
          },
        },
      }));

      toggleProductLikeMutation.mutate(productId, {
        onError: () => {
          // Revert on error
          refetch();
        },
      });
    },
    [toggleProductLikeMutation, refetch, queryClient]
  );

  const handleToggleUserLike = useCallback(
    (userId: string) => {
      // Optimistic update
      queryClient.setQueryData("loggedUser", (oldData: any) => ({
        ...oldData,
        data: {
          ...oldData.data,
          user: {
            ...oldData.data.user,
            likedUsers: oldData.data.user.likedUsers.filter(
              (u: LikedUser) => u._id !== userId
            ),
          },
        },
      }));

      toggleUserLikeMutation.mutate(userId, {
        onError: () => {
          // Revert on error
          refetch();
        },
      });
    },
    [toggleUserLikeMutation, refetch, queryClient]
  );

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => {
      const isLiked = item.likes.includes(userData?.data.user.id || "");

      return (
        <View style={styles.productItem}>
          <Image
            source={{ uri: `${BASE_URL}${item.images[0]}` }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productPrice}>${item.price}</Text>
            <TouchableOpacity onPress={() => handleToggleProductLike(item._id)}>
              <AntDesign
                name={isLiked ? "heart" : "hearto"}
                size={18}
                color={isLiked ? "red" : "black"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.productTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      );
    },
    [userData, handleToggleProductLike]
  );

  const renderProfileItem = useCallback(
    ({ item }: { item: LikedUser }) => {
      const productCount = item.products?.length || 0;

      return (
        <View style={styles.profileItem}>
          {productCount > 0 ? (
            <View style={styles.productGrid}>
              {item.products?.slice(0, 4).map((productId, index) => (
                <View key={index} style={styles.gridItem}>
                  <Image
                    source={{ uri: `${BASE_URL}/${productId}` }}
                    style={styles.gridImage}
                  />
                  {index === 3 && productCount > 4 && (
                    <View style={styles.overlay}>
                      <Text style={styles.overlayText}>
                        +{productCount - 3}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noProductsPlaceholder}>
              <AntDesign name="user" size={50} color={colors.secondary} />
              <Text style={styles.noProductsText}>{t("noProducts")}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text
              style={styles.profileName}
            >{`${item.firstName} ${item.lastName}`}</Text>
            <TouchableOpacity onPress={() => handleToggleUserLike(item._id)}>
              <AntDesign name="heart" size={18} color="red" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileReviews}>
            {t("reviewsCount", { count: item.reviewCount })}
          </Text>
        </View>
      );
    },
    [handleToggleUserLike]
  );

  const handleBackPress = () => navigation.goBack();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const likedProducts = userData?.data.user.likedProducts || [];
  const likedUsers = userData?.data.user.likedUsers || [];

  const renderContent = () => {
    if (isLoading && !isRefreshing) {
      return null; // Don't show anything on initial load
    }

    if (error) {
      return <Text style={styles.errorText}>{t("errorLoadingData")}</Text>;
    }

    if (activeTab === "liked-products") {
      return likedProducts.length > 0 ? (
        <FlatList
          data={likedProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
        />
      ) : (
        <Text style={styles.emptyMessage}>{t("noLikedProducts")}</Text>
      );
    } else {
      return likedUsers.length > 0 ? (
        <FlatList
          data={likedUsers}
          renderItem={renderProfileItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.profileRow}
        />
      ) : (
        <Text style={styles.emptyMessage}>{t("noLikedProfiles")}</Text>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header onBackPress={handleBackPress} />
      <TabSelector
        tabs={[
          { key: "liked-products", label: t("liked-products") },
          { key: "liked-profiles", label: t("liked-profiles") },
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab as (tab: string) => void}
      />
      <View style={styles.headerMargin} />
      <FlatList
        data={[{ key: "content" }]}
        renderItem={() => renderContent()}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerMargin: {
    marginTop: 10,
  },
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  productItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  productInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  productTitle: {
    fontSize: 14,
    paddingHorizontal: 5,
    paddingBottom: 5,
  },
  profileRow: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  profileItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    overflow: "hidden",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    aspectRatio: 1,
  },
  gridItem: {
    width: "50%",
    height: "50%",
    borderWidth: 1,
    borderColor: "white",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  noProductsPlaceholder: {
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
  },
  noProductsText: {
    marginTop: 10,
    color: colors.secondary,
    textAlign: "center",
  },
  profileInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  profileReviews: {
    fontSize: 14,
    color: colors.secondary,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: colors.secondary,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: colors.error,
    padding: 20,
  },
});

export default LikesPage;
