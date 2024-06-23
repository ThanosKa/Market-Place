// components/TabSelector.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";

type Props<T extends string> = {
  tabs: T[];
  activeTab: T;
  setActiveTab: (tab: T) => void;
};

const TabSelector = <T extends string>({
  tabs,
  activeTab,
  setActiveTab,
}: Props<T>) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[styles.tabText, activeTab === tab && styles.activeTabText]}
          >
            {t(tab)}
          </Text>
        </TouchableOpacity>
      ))}
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
