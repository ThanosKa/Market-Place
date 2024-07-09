// components/UserInfo.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import { User } from "../../interfaces/user";
import { BASE_URL } from "../../services/axiosConfig";

type Props = {
  user: User;
};

const UserInfo: React.FC<Props> = ({ user }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.userInfoContainer}>
      <Image
        source={{
          uri: user.profilePicture
            ? `${BASE_URL}/${user.profilePicture}`
            : undefined,
        }}
        style={styles.profileImage}
      />
      <View style={styles.userDetails}>
        <Text
          style={styles.userName}
        >{`${user.firstName} ${user.lastName}`}</Text>
        <Text style={styles.userStat}>
          {t("Reviews")}:{" "}
          <Text style={styles.statValue}>{user.reviewCount}</Text>
        </Text>
        <Text style={styles.userStat}>
          {t("Average Rating")}:{" "}
          <Text style={styles.statValue}>{user.averageRating.toFixed(1)}</Text>
        </Text>
        <Text style={styles.userStat}>
          {t("Products")}:{" "}
          <Text style={styles.statValue}>{user.products.length}</Text>
        </Text>
        {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}
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
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.primary,
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
  userBio: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 8,
  },
});

export default UserInfo;
