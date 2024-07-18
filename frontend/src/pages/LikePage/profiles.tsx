import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import { LikedUser } from "../../interfaces/user";
import { toggleLikeUser } from "../../services/likes";
import { BASE_URL } from "../../services/axiosConfig";
import { colors } from "../../colors/colors";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  userData: any;
  queryClient: any;
};

const RenderLikedProfiles: React.FC<Props> = ({ userData, queryClient }) => {
  const { t } = useTranslation();
  const [removingUsers, setRemovingUsers] = useState<string[]>([]);
  const userFadeAnims = useRef<{ [key: string]: Animated.Value }>({});

  const toggleUserLikeMutation = useMutation(toggleLikeUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("loggedUser");
    },
  });

  const handleToggleUserLike = useCallback(
    (userId: string) => {
      if (!userData?.data?.user) return;

      setRemovingUsers((prev) => [...prev, userId]);
      if (!userFadeAnims.current[userId]) {
        userFadeAnims.current[userId] = new Animated.Value(1);
      }
      Animated.timing(userFadeAnims.current[userId], {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        queryClient.setQueryData("loggedUser", (oldData: any) => {
          if (!oldData || !oldData.data || !oldData.data.user) {
            return oldData;
          }
          return {
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
          };
        });

        setRemovingUsers((prev) => prev.filter((id) => id !== userId));
      });

      toggleUserLikeMutation.mutate(userId, {
        onError: () => {
          setRemovingUsers((prev) => prev.filter((id) => id !== userId));
          if (userFadeAnims.current[userId]) {
            userFadeAnims.current[userId].setValue(1);
          }
          queryClient.invalidateQueries("loggedUser");
        },
      });
    },
    [toggleUserLikeMutation, queryClient, userData]
  );

  const renderProfileItem = useCallback(
    ({ item }: { item: LikedUser }) => {
      const productCount = item.products?.length || 0;
      const productsToShow = item.products?.slice(0, 4) || [];
      const isRemoving = removingUsers.includes(item._id);

      if (!userFadeAnims.current[item._id]) {
        userFadeAnims.current[item._id] = new Animated.Value(1);
      }

      const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const stars = [];

        for (let i = 0; i < 5; i++) {
          if (i < fullStars) {
            stars.push(
              <Ionicons
                key={i}
                name="star"
                size={16}
                color={colors.starYellow}
              />
            );
          } else if (i === fullStars && halfStar) {
            stars.push(
              <Ionicons
                key={i}
                name="star-half"
                size={16}
                color={colors.starYellow}
              />
            );
          } else {
            stars.push(
              <Ionicons
                key={i}
                name="star-outline"
                size={16}
                color={colors.starYellow}
              />
            );
          }
        }

        return stars;
      };

      return (
        <Animated.View
          style={[
            styles.profileItem,
            { opacity: userFadeAnims.current[item._id] },
          ]}
        >
          {productCount > 0 ? (
            <View style={styles.productGrid}>
              {productsToShow.map((product, index) => (
                <View
                  key={index}
                  style={[
                    styles.gridItem,
                    productCount === 1 && styles.singleGridItem,
                    productCount === 2 && styles.doubleGridItem,
                    productCount >= 3 && styles.multipleGridItem,
                    productCount >= 3 && index === 2 && styles.thirdGridItem,
                    productCount >= 4 && index === 3 && styles.fourthGridItem,
                  ]}
                >
                  <Image
                    source={{ uri: `${BASE_URL}${product.images[0]}` }}
                    style={styles.gridImage}
                  />
                  {index === 3 && productCount > 4 && (
                    <View style={styles.overlay}>
                      <Text style={styles.overlayText}>
                        +{productCount - 4}
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
          <View style={styles.profileDetails}>
            <View style={styles.profileNameContainer}>
              <Text style={styles.profileName}>
                {`${item.firstName} ${item.lastName}`}
              </Text>
              <TouchableOpacity
                onPress={() => handleToggleUserLike(item._id)}
                disabled={isRemoving}
              >
                <AntDesign name="heart" size={18} color="red" />
              </TouchableOpacity>
            </View>
            <View style={styles.ratingContainer}>
              {item.reviewCount > 0 ? (
                <>
                  {renderStars(item.averageRating)}
                  <Text style={styles.reviewCount}>({item.reviewCount})</Text>
                </>
              ) : (
                <Text style={styles.noReviews}>{t("no-reviews")}</Text>
              )}
            </View>
          </View>
        </Animated.View>
      );
    },
    [handleToggleUserLike, removingUsers, t]
  );

  const likedUsers = userData?.data?.user?.likedUsers || [];

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
};

const styles = StyleSheet.create({
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
    position: "relative",
    borderWidth: 1,
    borderColor: "white",
  },
  singleGridItem: {
    width: "100%",
    height: "100%",
  },
  doubleGridItem: {
    width: "50%",
    height: "100%",
  },
  multipleGridItem: {
    width: "50%",
    height: "50%",
  },
  thirdGridItem: {
    width: "100%",
    height: "50%",
  },
  fourthGridItem: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "50%",
    height: "50%",
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
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: colors.secondary,
    padding: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.secondary,
  },
  noReviews: {
    fontSize: 14,
    color: colors.secondary,
  },
  profileDetails: {
    padding: 10,
  },
  profileNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
});

export default RenderLikedProfiles;
