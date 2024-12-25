// SearchTabs.tsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../../colors/colors";

interface SearchTabsProps {
  activeTab: "products" | "users";
  setActiveTab: (tab: "products" | "users") => void;
}

const SearchTabs: React.FC<SearchTabsProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab("products")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "products" && styles.activeTabText,
          ]}
        >
          {t("products")}
        </Text>
        {activeTab === "products" && <View style={styles.activeTabLine} />}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab("users")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "users" && styles.activeTabText,
          ]}
        >
          {t("users")}
        </Text>
        {activeTab === "users" && <View style={styles.activeTabLine} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  tabButton: {
    marginRight: 24,
  },
  tabText: {
    fontSize: 16,
    color: colors.secondary,
    paddingVertical: 8,
  },
  activeTabText: {
    color: colors.primary,
  },
  activeTabLine: {
    height: 2,
    backgroundColor: colors.primary,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default SearchTabs;
