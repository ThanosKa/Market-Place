import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import DropDownPicker from "react-native-dropdown-picker";
import { Product } from "../../interfaces/product";
import {
  categories,
  conditions,
} from "../../interfaces/exploreCategories/iconsCategory";
import { colors } from "../../colors/colors";

interface EditProductFormProps {
  product: Product;
  onSave: (editedProduct: Partial<Product>) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  product,
  onSave,
  onCancel,
}) => {
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>(product);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setEditedProduct((prev) => ({ ...prev, [field]: value }));
  };
  const handlePriceChange = (value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      handleInputChange("price", numericValue);
    } else {
      // Set to 0 when the input is cleared or invalid
      handleInputChange("price", 0);
    }
  };

  const isFormValid = useMemo(() => {
    return (
      editedProduct.title &&
      editedProduct.title.trim() !== "" &&
      editedProduct.price !== undefined &&
      editedProduct.price >= 0 &&
      editedProduct.condition &&
      editedProduct.category
    );
  }, [editedProduct]);

  const handleSave = () => {
    setIsSaving(true);
    onSave(editedProduct);
  };

  return (
    <View>
      <Text style={styles.label}>{t("title")}</Text>
      <TextInput
        style={styles.input}
        value={editedProduct.title}
        onChangeText={(value) => handleInputChange("title", value)}
        placeholder={t("enter-title")}
      />

      <Text style={styles.label}>{t("price")}</Text>
      <TextInput
        style={styles.input}
        value={editedProduct.price?.toString() || ""}
        onChangeText={handlePriceChange}
        placeholder={t("enter-price")}
        keyboardType="numeric"
      />

      <Text style={styles.label}>{t("description")}</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={editedProduct.description}
        onChangeText={(value) => handleInputChange("description", value)}
        placeholder={t("enter-description")}
        multiline
      />

      <Text style={styles.label}>{t("condition")}</Text>
      <DropDownPicker
        open={conditionOpen}
        value={editedProduct.condition || null}
        items={conditions.map((cond) => ({
          label: t(cond.label),

          value: cond.value,
        }))}
        setOpen={setConditionOpen}
        setValue={(callback) => {
          if (typeof callback === "function") {
            const newValue = callback(editedProduct.condition || null);
            handleInputChange("condition", newValue as string);
          } else {
            handleInputChange("condition", callback as string);
          }
        }}
        placeholder={t("select-condition")}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownList}
        selectedItemContainerStyle={styles.selectedItemContainer}
        selectedItemLabelStyle={styles.selectedItemLabel}
        maxHeight={200}
        listMode="SCROLLVIEW"
      />

      <Text style={styles.label}>{t("category")}</Text>
      <DropDownPicker
        open={categoryOpen}
        value={editedProduct.category || null}
        items={categories.map((cat) => ({
          label: t(cat.label),
          value: cat.value,
        }))}
        setOpen={setCategoryOpen}
        setValue={(callback) => {
          if (typeof callback === "function") {
            const newValue = callback(editedProduct.category || null);
            handleInputChange("category", newValue as string);
          } else {
            handleInputChange("category", callback as string);
          }
        }}
        placeholder={t("select-category")}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownList}
        selectedItemContainerStyle={styles.selectedItemContainer}
        selectedItemLabelStyle={styles.selectedItemLabel}
        maxHeight={200}
        listMode="SCROLLVIEW"
      />

      <View style={styles.editButtonsContainer}>
        <TouchableOpacity
          style={[styles.editButton, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.editButton,
            styles.saveButton,
            (!isFormValid || isSaving) && styles.disabledSaveButton,
          ]}
          onPress={handleSave}
          disabled={!isFormValid || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>{t("save")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: colors.primary,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 46,
    marginBottom: 15,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdown: {
    backgroundColor: "white",
    borderColor: "#ddd",
    height: 46,
    marginBottom: 15,
  },
  dropdownList: {
    backgroundColor: "white",
    borderColor: "#ddd",
  },
  selectedItemContainer: {
    backgroundColor: colors.lightGray,
  },
  selectedItemLabel: {
    fontWeight: "bold",
  },
  editButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "white",
    borderColor: colors.customBlueDarker,
    borderWidth: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: colors.customBlueDarker,
    fontWeight: "bold",
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: colors.customBlueDarker,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  disabledSaveButton: {
    opacity: 0.5,
  },
});

export default EditProductForm;
