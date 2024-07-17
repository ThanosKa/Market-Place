// components/UserInfo.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import { User } from "../../interfaces/user";
import { BASE_URL } from "../../services/axiosConfig";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons"; // Add this import

type Props = {
  user: User;
};

const UserInfo: React.FC<Props> = ({ user }) => {
  const { t } = useTranslation();

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

  return (
    <View style={styles.userInfoContainer}>
      {user.profilePicture ? (
        <Image
          source={{
            uri: `${BASE_URL}/${user.profilePicture}`,
          }}
          style={styles.profileImage}
        />
      ) : (
        <View style={styles.defaultProfileImage}>
          <Feather name="user" size={50} color={colors.secondary} />
        </View>
      )}
      <View style={styles.userDetails}>
        <Text
          style={styles.userName}
        >{`${user.firstName} ${user.lastName}`}</Text>
        {user.reviewCount > 0 ? (
          <View style={styles.ratingContainer}>
            {renderStars(user.averageRating)}
            <Text style={styles.reviewCount}>({user.reviewCount})</Text>
          </View>
        ) : (
          <Text style={styles.noReviews}>{t("no-reviews")}</Text>
        )}
        <Text style={styles.userStat}>
          {t("for-sale")}:{" "}
          <Text style={styles.statValue}>{user.products.length}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfoContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 0.25,
    borderBottomColor: colors.secondary,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
    backgroundColor: colors.secondary,
  },
  userDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.primary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.secondary,
  },
  noReviews: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },
  userStat: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: "bold",
    color: colors.primary,
  },
  defaultProfileImage: {
    width: 100,

    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
});

export default UserInfo;