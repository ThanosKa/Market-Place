// components/TabSelector.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";

type Props = {
  activeTab: "listings" | "reviews";
  setActiveTab: (tab: "listings" | "reviews") => void;
};

const TabSelector: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "listings" && styles.activeTab]}
        onPress={() => setActiveTab("listings")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "listings" && styles.activeTabText,
          ]}
        >
          {t("Listings")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
        onPress={() => setActiveTab("reviews")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "reviews" && styles.activeTabText,
          ]}
        >
          {t("Reviews")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 0.25,
    borderBottomColor: colors.secondary,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary,
  },
  activeTabText: {
    color: colors.primary,
  },
});

export default TabSelector;
