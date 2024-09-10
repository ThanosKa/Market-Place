import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../colors/colors";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity style={styles.chip} onPress={onRemove}>
      <Text style={styles.chipText}>{t(label)}</Text>
      <Ionicons name="close" size={18} color={colors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.senderBubble,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: {
    marginRight: 4,
    color: colors.primary,
    fontWeight: "500",
  },
});

export default FilterChip;
