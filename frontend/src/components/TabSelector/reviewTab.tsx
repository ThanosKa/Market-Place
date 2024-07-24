import React from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { Review } from "../../interfaces/review";
import ReviewItem from "../Reviews/ReviewItem";
import { colors } from "../../colors/colors";

type Props = {
  reviews: Review[];
  user?: boolean;
  firstName?: string;
  lastName?: string;
  isLoading: boolean;
};

const ReviewsTab: React.FC<Props> = ({
  reviews,
  user,
  firstName,
  lastName,
  isLoading,
}) => {
  // console.log("reviews", reviews);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {user && <Text style={styles.emptyText}>{t("no-reviews-yet")}</Text>}
        {!user && firstName && lastName && (
          <Text style={styles.emptyText}>
            {`${firstName} ${lastName} ${t("no-reviews-user")}`}
          </Text>
        )}
        {!user && (!firstName || !lastName) && (
          <Text style={styles.emptyText}>{t("no-reviews-user")}</Text>
        )}
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
    paddingBottom: 10,
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ReviewsTab;
