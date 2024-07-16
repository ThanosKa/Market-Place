// components/ReviewItem.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import { Review } from "../../interfaces/review";
import { BASE_URL } from "../../services/axiosConfig";

type Props = {
  review: Review;
};

const ReviewItem: React.FC<Props> = ({ review }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.outerContainer}>
      <View style={styles.reviewContainer}>
        <View style={styles.reviewContent}>
          <View style={styles.reviewImageContainer}>
            <Image
              source={{
                uri:
                  review.product &&
                  review.product.images &&
                  review.product.images.length > 0
                    ? `${BASE_URL}${review.product.images[0]}`
                    : undefined,
              }}
              style={styles.reviewProductImage}
            />
            <Image
              source={{
                uri: review.reviewer.profilePicture
                  ? `${BASE_URL}/${review.reviewer.profilePicture}`
                  : undefined,
              }}
              style={styles.reviewerImage}
            />
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
              <Text>
                <Text style={styles.byText}>{t("by")}</Text>
                <Text style={styles.reviewerName}>
                  {` ${review.reviewer.firstName} ${review.reviewer.lastName}`}
                </Text>
              </Text>
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
    color: colors.secondary,
    marginBottom: 10,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.primary,

    marginBottom: 10,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
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
