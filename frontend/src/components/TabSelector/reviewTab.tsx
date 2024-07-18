// components/ReviewsTab.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Review } from "../../interfaces/review";
import ReviewItem from "../Reviews/ReviewItem";

type Props = {
  reviews: Review[];
  user?: boolean;
  firstName?: string;
  lastName?: string;
};

const ReviewsTab: React.FC<Props> = ({
  reviews,
  user,
  firstName,
  lastName,
}) => {
  const { t } = useTranslation();

  console.log(user, firstName, lastName);
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
});

export default ReviewsTab;
