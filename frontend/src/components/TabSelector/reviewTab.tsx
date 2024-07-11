// components/ReviewsTab.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Review } from "../../interfaces/review";
import ReviewItem from "./ReviewItem";

type Props = {
  reviews: Review[];
};

const ReviewsTab: React.FC<Props> = ({ reviews }) => {
  const { t } = useTranslation();

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t("no-reviews-yet")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.reviewsContainer}>
      {reviews.map((review) => (
        <ReviewItem key={review._id} review={review} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  reviewsContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});

export default ReviewsTab;
