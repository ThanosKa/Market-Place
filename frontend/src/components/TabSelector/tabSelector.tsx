// components/TabSelector.tsx

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";

type Tab = {
  key: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabSelector: React.FC<Props> = ({ tabs, activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
            ]}
          >
            {tab.label}
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
