// components/ProfileTab.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons, Feather, AntDesign } from "@expo/vector-icons";

import { colors } from "../../colors/colors";
import { User } from "../../components/UserProfile/types";

type Props = {
  user: User;
};

const ProfileTab: React.FC<Props> = ({ user }) => {
  const { t } = useTranslation();

  const renderSection = (
    title: string,
    items: { label: string; onPress: () => void }[]
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.item}
          onPress={item.onPress}
        >
          <Text style={styles.itemText}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderSection(t("Transactions"), [
        {
          label: t("Purchases"),
          onPress: () => console.log("Navigate to Purchases"),
        },
        {
          label: t("Sales"),
          onPress: () => console.log("Navigate to Sales"),
        },
        {
          label: t("Balance"),
          onPress: () => console.log("Navigate to Balance"),
        },
      ])}
      {renderSection(t("Account"), [
        {
          label: t("Language"),
          onPress: () => console.log("Open Language settings"),
        },
        {
          label: t("Edit Profile"),
          onPress: () => console.log("Open Edit Profile"),
        },
        {
          label: t("Shipping Address"),
          onPress: () => console.log("Open Shipping Address settings"),
        },
        {
          label: t("Logout"),
          onPress: () => console.log("Perform logout"),
        },
        {
          label: t("Delete Account"),
          onPress: () => console.log("Open Delete Account confirmation"),
        },
      ])}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.primary,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  itemText: {
    fontSize: 16,
    color: colors.primary,
  },
});

export default ProfileTab;
