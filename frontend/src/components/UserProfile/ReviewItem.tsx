// components/ReviewItem.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import { Review } from "./types";

type Props = {
  review: Review;
};

const ReviewItem: React.FC<Props> = ({ review }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.reviewContainer}>
      <View style={styles.reviewContent}>
        <View style={styles.reviewImageContainer}>
          <Image
            source={{ uri: review.productImage }}
            style={styles.reviewProductImage}
          />
          <Image
            source={{ uri: review.reviewerImage }}
            style={styles.reviewerImage}
          />
        </View>
        <View style={styles.reviewInfoContainer}>
          <View style={styles.reviewHeader}>
            <Text style={styles.soldText}>{t("Sold")}</Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, index) => (
                <AntDesign
                  key={index}
                  name={index < review.rating ? "star" : "staro"}
                  size={16}
                  color={colors.primary}
                />
              ))}
            </View>
          </View>
          <Text style={styles.itemName}>{review.itemName}</Text>
          <Text style={styles.reviewComment}>{review.comment}</Text>
          <View style={styles.reviewFooter}>
            <Text style={styles.reviewerName}>{review.reviewerName}</Text>
            <Text style={styles.purchaseDate}>{review.purchaseDate}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// components/ReviewItem.tsx (continued)

const styles = StyleSheet.create({
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
  soldText: {
    fontSize: 14,
    color: colors.secondary,
  },
  ratingContainer: {
    flexDirection: "row",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 8,
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
  purchaseDate: {
    fontSize: 12,
    color: colors.secondary,
  },
});

export default ReviewItem;
