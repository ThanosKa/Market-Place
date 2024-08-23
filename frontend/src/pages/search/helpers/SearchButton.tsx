// SearchButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../colors/colors";

interface SearchButtonProps {
  onPress: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onPress }) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity style={styles.searchButton} onPress={onPress}>
      <Ionicons name="search" size={20} color={colors.primary} />
      <Text style={styles.searchButtonText}>{t("search")}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  searchButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.secondary,
  },
});

export default SearchButton;
