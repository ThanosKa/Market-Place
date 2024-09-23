// components/UserInfo.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import { User } from "../../interfaces/user";
import { Feather } from "@expo/vector-icons";
import { renderStars } from "../../utils/renderStars";

type Props = {
  user: User;
  totalProducts: number;
  totalLikes?: number;
};

const UserInfo: React.FC<Props> = ({ user, totalProducts, totalLikes }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.userInfoContainer}>
      {user.profilePicture ? (
        <Image
          source={{
            uri: `${user.profilePicture}`,
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
        {totalProducts > 0 ? (
          <Text style={styles.userStat}>
            {t("for-sale")}:{" "}
            <Text style={styles.statValue}>{totalProducts}</Text>
          </Text>
        ) : (
          <Text style={styles.userStat}>{t("nothing-sale")}</Text>
        )}
        {totalLikes !== undefined && totalLikes > 0 && (
          <Text style={styles.userStat}>
            {t("profile-likes")}:{" "}
            <Text style={styles.statValue}>{totalLikes}</Text>
          </Text>
        )}
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
