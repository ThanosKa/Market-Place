import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import { Review } from "../../interfaces/review";
import { BASE_URL } from "../../services/axiosConfig";
import UndefProfPicture from "../UndefProfPicture/UndefProfPicture";
import { getUserId } from "../../services/authStorage";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { useNavigation } from "@react-navigation/native";

type Props = {
  review: Review;
};

const ReviewItem: React.FC<Props> = ({ review }) => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { t } = useTranslation();

  const handleUserPress = async (userId: string) => {
    const loggedUserId = await getUserId();
    if (loggedUserId === userId) {
      navigation.navigate("MainTabs");
      navigation.navigate("Profile", { refreshProfile: Date.now() });
    } else {
      navigation.navigate("UserProfile", { userId });
    }
  };

  useEffect(() => {
    const checkCurrentUser = async () => {
      const loggedUserId = await getUserId();
      setIsCurrentUser(loggedUserId === review.reviewer._id);
    };
    checkCurrentUser();
  }, [review.reviewer._id]);
  const handleProductPress = () => {
    if (review.product && review.product._id) {
      navigation.navigate("Product", { productId: review.product._id });
    }
  };
  // If the product doesn't exist, don't render the review
  if (!review.product) {
    return null;
  }
  return (
    <View style={styles.outerContainer}>
      <View style={styles.reviewContainer}>
        <View style={styles.reviewContent}>
          <View style={styles.reviewImageContainer}>
            <TouchableOpacity onPress={handleProductPress}>
              <Image
                source={{
                  uri:
                    review.product?.images && review.product.images.length > 0
                      ? `${BASE_URL}${review.product.images[0]}`
                      : undefined,
                }}
                style={styles.reviewProductImage}
              />
            </TouchableOpacity>
            {review.reviewer.profilePicture ? (
              <Image
                source={{
                  uri: `${BASE_URL}/${review.reviewer.profilePicture}`,
                }}
                style={styles.reviewerImage}
              />
            ) : (
              <View style={styles.reviewerImageUndef}>
                <UndefProfPicture size={40} iconSize={20} />
              </View>
            )}
          </View>
          <View style={styles.reviewInfoContainer}>
            <View style={styles.reviewHeader}>
              {review.product && (
                <Text style={styles.itemName}>{review.product.title}</Text>
              )}
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, index) => (
                  <AntDesign
                    key={index}
                    name={index < review.rating ? "star" : "staro"}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <View style={styles.reviewFooter}>
              <View style={styles.reviewerInfo}>
                <Text style={styles.byText}>{t("by")}</Text>
                <TouchableOpacity
                  onPress={() => handleUserPress(review.reviewer._id)}
                >
                  <Text style={styles.reviewerName}>
                    {` ${review.reviewer.firstName} ${review.reviewer.lastName}`}
                    {isCurrentUser && (
                      <Text style={styles.youText}> ({t("you")})</Text>
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.purchaseDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    gap: 10,
  },
  reviewContainer: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
    paddingBottom: 16,
  },
  reviewContent: {
    flexDirection: "row",
  },
  reviewImageContainer: {
    position: "relative",
    width: 80,
    height: 80,
    marginRight: 16,
  },
  reviewProductImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  youText: {
    fontWeight: "normal",
    color: colors.secondary,
  },
  reviewerImage: {
    position: "absolute",
    bottom: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  reviewerImageUndef: {
    position: "absolute",
    bottom: -10,
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 25,
    right: -10,
  },
  reviewInfoContainer: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.primary,

    marginBottom: 14,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.secondary,
  },
  byText: {
    color: colors.secondary,
  },
  purchaseDate: {
    fontSize: 12,
    color: colors.secondary,
  },
  placeholderImage: {
    backgroundColor: colors.secondary,
  },
});

export default ReviewItem;
