// utils/starRating.tsx
import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../colors/colors";

export const renderStars = (rating: number): JSX.Element => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const stars: JSX.Element[] = [];

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

  return <View style={{ flexDirection: "row" }}>{stars}</View>;
};
