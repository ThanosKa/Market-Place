// components/ReviewsTab.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import ReviewItem from "./ReviewItem";
import { Review } from "./types";

type Props = {
  reviews: Review[];
};

const ReviewsTab: React.FC<Props> = ({ reviews }) => (
  <View style={styles.reviewsContainer}>
    {reviews.map((review) => (
      <ReviewItem key={review.id} review={review} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  reviewsContainer: {
    padding: 16,
  },
});

export default ReviewsTab;
