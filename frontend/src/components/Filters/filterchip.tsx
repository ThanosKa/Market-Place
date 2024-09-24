import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../colors/colors";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  type: "price" | "sort" | "condition";
  sortType?: "price" | "createdAt";
  sortOrder?: "asc" | "desc" | null;
  minPrice?: string;
  maxPrice?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  onRemove,
  type,
  sortType,
  sortOrder,
  minPrice,
  maxPrice,
}) => {
  const { t } = useTranslation();

  const formatPrice = (price: string) => {
    return `${price}$`;
  };

  const getPriceLabel = () => {
    if (minPrice && maxPrice) {
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    } else if (minPrice) {
      return t("from") + " " + formatPrice(minPrice);
    } else if (maxPrice) {
      return t("max") + " " + formatPrice(maxPrice);
    }
    return "";
  };

  const getChipLabel = () => {
    switch (type) {
      case "price":
        return `${t("price")}: ${getPriceLabel()}`;
      case "sort":
        if (sortType === "price") {
          return `${t("sort-by")}: ${
            sortOrder === "asc" ? t("cheapest") : t("most-expensive")
          }`;
        } else if (sortType === "createdAt") {
          return `${t("sort-by")}: ${
            sortOrder === "asc" ? t("oldest") : t("newest")
          }`;
        }
        return `${t("sort-by")}: ${label}`;
      case "condition":
        return t(label);
      default:
        return t(label);
    }
  };

  return (
    <TouchableOpacity style={styles.chip} onPress={onRemove}>
      <Text style={styles.chipText}>{getChipLabel()}</Text>
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
