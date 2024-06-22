// components/UserInfo.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import { User } from "./types";

type Props = {
  user: User;
};

const UserInfo: React.FC<Props> = ({ user }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.userInfoContainer}>
      <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
      <View style={styles.userDetails}>
        <Text
          style={styles.userName}
        >{`${user.firstName} ${user.lastName}`}</Text>
        <Text style={styles.userStat}>
          {t("Reviews")}: <Text style={styles.statValue}>{user.reviews}</Text>
        </Text>
        <Text style={styles.userStat}>
          {t("Sales")}: <Text style={styles.statValue}>{user.sales}</Text> |
          {t("Purchases")}:{" "}
          <Text style={styles.statValue}>{user.purchases}</Text>
        </Text>
        <Text style={styles.userLocation}>{user.location}</Text>
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
  userLocation: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  },
});

export default UserInfo;
