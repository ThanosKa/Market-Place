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
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import { toggleLikeUser } from "../../services/likes";
import { BASE_URL } from "../../services/axiosConfig";
import { colors } from "../../colors/colors";
import { LikedUser } from "../../interfaces/user";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { useNavigation } from "@react-navigation/native";
import { getUserId } from "../../services/authStorage";
import { Skeleton } from "@rneui/themed";

type Props = {
  likedProfilesData: LikedUser[];
  queryClient: any;
};

const RenderLikedProfiles: React.FC<Props> = ({
  likedProfilesData,
  queryClient,
}) => {
  const { t } = useTranslation();
  const [removingUsers, setRemovingUsers] = useState<string[]>([]);
  const fadeAnims = useRef<{ [key: string]: Animated.Value }>({});
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  const toggleUserLikeMutation = useMutation(toggleLikeUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("likedProfiles");
    },
  });

  const handleUserPress = async (userId: string) => {
    const loggedUserId = await getUserId();
    if (loggedUserId === userId) {
      navigation.navigate("MainTabs");
      navigation.navigate("Profile", {});
    } else {
      navigation.navigate("UserProfile", { userId });
    }
  };

  const handleProductPress = useCallback(
    (productId: string) => {
      navigation.navigate("Product", { productId });
    },
    [navigation]
  );

  const handleToggleUserLike = useCallback(
    (userId: string) => {
      setRemovingUsers((prev) => [...prev, userId]);
      if (!fadeAnims.current[userId]) {
        fadeAnims.current[userId] = new Animated.Value(1);
      }
      Animated.timing(fadeAnims.current[userId], {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        queryClient.setQueryData("likedProfiles", (oldData: LikedUser[]) => {
          return oldData.filter((user) => user._id !== userId);
        });

        setRemovingUsers((prev) => prev.filter((id) => id !== userId));
      });

      toggleUserLikeMutation.mutate(userId, {
        onError: () => {
          setRemovingUsers((prev) => prev.filter((id) => id !== userId));
          if (fadeAnims.current[userId]) {
            fadeAnims.current[userId].setValue(1);
          }
          queryClient.invalidateQueries("likedProfiles");
        },
      });
    },
    [toggleUserLikeMutation, queryClient]
  );

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color={colors.starYellow} />
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

  const renderProfileItem = useCallback(
    ({ item }: { item: LikedUser }) => {
      const productCount = item.products.length;
      const productsToShow = item.products.slice(0, 4);
      const isRemoving = removingUsers.includes(item._id);

      if (!fadeAnims.current[item._id]) {
        fadeAnims.current[item._id] = new Animated.Value(1);
      }

      return (
        <Animated.View
          style={[styles.profileItem, { opacity: fadeAnims.current[item._id] }]}
        >
          {productCount > 0 ? (
            <View style={styles.productGrid}>
              {productsToShow.map((product, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.gridItem,
                    productCount === 1 && styles.singleGridItem,
                    productCount === 2 && styles.doubleGridItem,
                    productCount >= 3 && styles.multipleGridItem,
                    productCount >= 3 && index === 2 && styles.thirdGridItem,
                    productCount >= 4 && index === 3 && styles.fourthGridItem,
                  ]}
                  onPress={() => handleProductPress(product._id)}
                >
                  <Image
                    source={{ uri: `${product.images[0]}` }}
                    style={styles.gridImage}
                  />
                  {index === 3 && productCount > 4 && (
                    <View style={styles.overlay}>
                      <Text style={styles.overlayText}>
                        +{productCount - 4}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noProductsPlaceholder}>
              <AntDesign name="user" size={50} color={colors.secondary} />
              <Text style={styles.noProductsText}>{t("noProducts")}</Text>
            </View>
          )}
          <View style={styles.profileDetails}>
            <TouchableOpacity onPress={() => handleUserPress(item._id)}>
              <View style={styles.profileNameContainer}>
                <View style={styles.profileImageNameContainer}>
                  <Image
                    source={{ uri: `${item.profilePicture}` }}
                    style={styles.profileImage}
                  />
                  <Text
                    style={styles.profileName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {`${item.firstName} ${item.lastName}`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleToggleUserLike(item._id)}
                  disabled={isRemoving}
                >
                  <AntDesign name="heart" size={18} color="red" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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
    [
      handleToggleUserLike,
      removingUsers,
      t,
      navigation,
      handleUserPress,
      renderStars,
      handleProductPress,
    ]
  );

  return likedProfilesData && likedProfilesData.length > 0 ? (
    <FlatList
      data={likedProfilesData}
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
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: colors.secondary,
    padding: 20,
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
  profileImageNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    marginRight: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
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
});

export default RenderLikedProfiles;
