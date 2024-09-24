import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheet } from "@rneui/themed";
import { colors } from "../../colors/colors";

export interface Filters {
  minPrice: string;
  maxPrice: string;
  sort: "price" | "createdAt" | null;
  order: "asc" | "desc" | null;
  conditions: string[];
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface SortOption {
  id: "price" | "createdAt";
  label: string;
}

export interface FilterOptions {
  conditions: FilterOption[];
  sortOptions: SortOption[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  initialFilters: Filters;
  filterOptions: FilterOptions;
  showPriceFilter?: boolean;
  showSortFilter?: boolean;
  showConditionFilter?: boolean;
}

const { width } = Dimensions.get("window");

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  filterOptions,
  showPriceFilter = true,
  showSortFilter = true,
  showConditionFilter = true,
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    setFilters(initialFilters);
    setPriceError(null);
  }, [initialFilters]);

  const handleApply = () => {
    if (priceError) {
      Alert.alert(t("error"), priceError);
      return;
    }
    onApply(filters);
    onClose();
  };

  const toggleSort = (newSort: "price" | "createdAt") => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      sort: prevFilters.sort === newSort ? null : newSort,
      order: null,
    }));
  };

  const toggleOrder = (order: "asc" | "desc") => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      order: prevFilters.order === order ? null : order,
    }));
  };

  const toggleCondition = (value: string) => {
    setFilters((prevFilters) => {
      const updatedConditions = prevFilters.conditions.includes(value)
        ? prevFilters.conditions.filter((c) => c !== value)
        : [...prevFilters.conditions, value];
      return { ...prevFilters, conditions: updatedConditions };
    });
  };

  const handlePriceInput = (type: "minPrice" | "maxPrice", value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    const numberValue = Number(numericValue);

    if (numberValue >= 0) {
      setFilters((prevFilters) => {
        const updatedFilters = { ...prevFilters, [type]: numericValue };

        // Check if both min and max prices are set
        if (updatedFilters.minPrice && updatedFilters.maxPrice) {
          const minPrice = Number(updatedFilters.minPrice);
          const maxPrice = Number(updatedFilters.maxPrice);

          if (maxPrice <= minPrice) {
            setPriceError(t("max-price-must-be-greater"));
          } else {
            setPriceError(null);
          }
        } else {
          setPriceError(null);
        }

        return updatedFilters;
      });
    }
  };

  return (
    <BottomSheet isVisible={visible} onBackdropPress={onClose}>
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={styles.modalTitle}>{t("filters")}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {showPriceFilter && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("price-range")}</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder={t("min-price")}
                  keyboardType="numeric"
                  value={filters.minPrice}
                  onChangeText={(text) => handlePriceInput("minPrice", text)}
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder={t("max-price")}
                  keyboardType="numeric"
                  value={filters.maxPrice}
                  onChangeText={(text) => handlePriceInput("maxPrice", text)}
                />
              </View>
              {priceError && <Text style={styles.errorText}>{priceError}</Text>}
            </View>
          )}

          {showSortFilter && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("sort-by")}</Text>
              <View style={styles.sortContainer}>
                {filterOptions.sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortButton,
                      filters.sort === option.id && styles.selectedSort,
                    ]}
                    onPress={() => toggleSort(option.id)}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        filters.sort === option.id && styles.selectedSortText,
                      ]}
                    >
                      {t(option.label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {filters.sort && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("order")}</Text>
              <View style={styles.orderContainer}>
                <TouchableOpacity
                  style={[
                    styles.orderButton,
                    filters.order === "asc" && styles.selectedOrder,
                  ]}
                  onPress={() => toggleOrder("asc")}
                >
                  <Text
                    style={[
                      styles.orderButtonText,
                      filters.order === "asc" && styles.selectedOrderText,
                    ]}
                  >
                    {filters.sort === "price" ? t("cheapest") : t("oldest")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.orderButton,
                    filters.order === "desc" && styles.selectedOrder,
                  ]}
                  onPress={() => toggleOrder("desc")}
                >
                  <Text
                    style={[
                      styles.orderButtonText,
                      filters.order === "desc" && styles.selectedOrderText,
                    ]}
                  >
                    {filters.sort === "price"
                      ? t("most-expensive")
                      : t("newest")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showConditionFilter && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("condition")}</Text>
              <View style={styles.conditionContainer}>
                {filterOptions.conditions.map((condition) => (
                  <TouchableOpacity
                    key={condition.value}
                    style={[
                      styles.conditionButton,
                      filters.conditions.includes(condition.value) &&
                        styles.selectedCondition,
                    ]}
                    onPress={() => toggleCondition(condition.value)}
                  >
                    <Text
                      style={[
                        styles.conditionButtonText,
                        filters.conditions.includes(condition.value) &&
                          styles.selectedConditionText,
                      ]}
                    >
                      {t(condition.label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>{t("apply-filters")}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderFilter,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  priceSeparator: {
    fontSize: 20,
    marginHorizontal: 12,
    color: "#333",
  },
  errorText: {
    color: "red",
    marginTop: 8,
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderFilter,
    borderRadius: 25,
    padding: 12,
    width: width * 0.42,
  },
  selectedSort: {
    backgroundColor: colors.customBlue,
    borderColor: colors.customBlue,
  },
  sortButtonText: {
    fontSize: 16,
    color: "#333",
  },
  selectedSortText: {
    color: "#fff",
  },
  orderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderFilter,
    borderRadius: 25,
    padding: 12,
    width: width * 0.42,
  },
  selectedOrder: {
    backgroundColor: colors.customBlue,
    borderColor: colors.customBlue,
  },
  orderButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  selectedOrderText: {
    color: "#fff",
  },
  conditionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  conditionButton: {
    borderWidth: 1,
    borderColor: colors.borderFilter,
    borderRadius: 25,
    padding: 12,
    margin: 4,
  },
  selectedCondition: {
    backgroundColor: colors.customBlue,
    borderColor: colors.customBlue,
  },
  conditionButtonText: {
    fontSize: 16,
    color: "#333",
  },
  selectedConditionText: {
    color: "#fff",
  },
  applyButton: {
    backgroundColor: colors.ownBubble,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default FilterModal;
