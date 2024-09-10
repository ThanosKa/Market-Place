import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";

interface Filters {
  minPrice: string;
  maxPrice: string;
  order: "" | "asc" | "desc";
  condition: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  initialFilters: Filters;
  conditions: Array<{ id: string; label: string; value: string }>;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  conditions,
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t("filters")}</Text>

          <ScrollView>
            <Text style={styles.sectionTitle}>{t("price-range")}</Text>
            <View style={styles.priceInputContainer}>
              <TextInput
                style={styles.priceInput}
                placeholder={t("min-price")}
                keyboardType="numeric"
                value={filters.minPrice}
                onChangeText={(text) =>
                  setFilters({ ...filters, minPrice: text })
                }
              />
              <TextInput
                style={styles.priceInput}
                placeholder={t("max-price")}
                keyboardType="numeric"
                value={filters.maxPrice}
                onChangeText={(text) =>
                  setFilters({ ...filters, maxPrice: text })
                }
              />
            </View>

            <Text style={styles.sectionTitle}>{t("order")}</Text>
            <View style={styles.orderContainer}>
              <TouchableOpacity
                style={[
                  styles.orderButton,
                  filters.order === "asc" && styles.selectedOrder,
                ]}
                onPress={() => setFilters({ ...filters, order: "asc" })}
              >
                <Text>{t("ascending")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.orderButton,
                  filters.order === "desc" && styles.selectedOrder,
                ]}
                onPress={() => setFilters({ ...filters, order: "desc" })}
              >
                <Text>{t("descending")}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>{t("condition")}</Text>
            <View style={styles.conditionContainer}>
              {conditions.map((condition) => (
                <TouchableOpacity
                  key={condition.value}
                  style={[
                    styles.conditionButton,
                    filters.condition === condition.value &&
                      styles.selectedCondition,
                  ]}
                  onPress={() =>
                    setFilters({ ...filters, condition: condition.value })
                  }
                >
                  <Text>{t(condition.label)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text>{t("cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>{t("apply")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  priceInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 5,
    padding: 10,
    width: "48%",
  },
  orderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderButton: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 5,
    padding: 10,
    width: "48%",
    alignItems: "center",
  },
  selectedOrder: {
    backgroundColor: colors.primary,
  },
  conditionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  conditionButton: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
  selectedCondition: {
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 5,
    padding: 10,
    width: "48%",
    alignItems: "center",
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  applyButtonText: {
    color: colors.white,
  },
});

export default FilterModal;
