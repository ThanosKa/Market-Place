import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../../colors/colors";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  return (
    <TouchableOpacity style={styles.chip} onPress={onRemove}>
      <Text style={styles.chipText}>{label}</Text>
      <Text style={styles.removeIcon}>×</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    marginRight: 4,
  },
  removeIcon: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FilterChip;
