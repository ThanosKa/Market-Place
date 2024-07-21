import React, { useState, useEffect } from "react";
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
import {
  categories,
  conditions,
} from "../../interfaces/exploreCategories/iconsCategory";
import { colors } from "../../colors/colors";

export interface ProductFormData {
  title: string;
  price: string;
  category: string | null;
  condition: string | null;
}

interface ProductFormProps {
  onSubmit: (formData: ProductFormData) => void;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);

  useEffect(() => {
    if (categoryOpen) {
      setConditionOpen(false);
    }
  }, [categoryOpen]);

  useEffect(() => {
    if (conditionOpen) {
      setCategoryOpen(false);
    }
  }, [conditionOpen]);

  const handleSubmit = () => {
    onSubmit({ title, price, category, condition });
  };
  const handlePriceChange = (text: string) => {
    // Remove any non-numeric characters
    const numericPrice = text.replace(/[^0-9]/g, "");
    setPrice(numericPrice);
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("title")}</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={(text) => setTitle(text.toString())}
          placeholder={t("e.g. iPhone 13")}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("price")}</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={handlePriceChange}
          placeholder={t("e.g. 250")}
          keyboardType="numeric"
        />
      </View>

      <View style={[styles.inputContainer, { zIndex: 3000 }]}>
        <Text style={styles.label}>{t("category")}</Text>
        <DropDownPicker
          open={categoryOpen}
          value={category}
          items={categories.map((cat) => ({
            label: t(cat.label),
            value: cat.value,
          }))}
          setOpen={setCategoryOpen}
          setValue={setCategory}
          placeholder={t("select-category")}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          selectedItemContainerStyle={styles.selectedItemContainer}
          selectedItemLabelStyle={styles.selectedItemLabel}
          maxHeight={300}
        />
      </View>

      <View style={[styles.inputContainer, { zIndex: 3000 }]}>
        <Text style={styles.label}>{t("condition")}</Text>
        <DropDownPicker
          open={conditionOpen}
          value={condition}
          items={conditions.map((cond) => ({
            label: t(cond.label),
            value: cond.value,
          }))}
          setOpen={setConditionOpen}
          setValue={setCondition}
          placeholder={t("select-condition")}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          selectedItemContainerStyle={styles.selectedItemContainer}
          selectedItemLabelStyle={styles.selectedItemLabel}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>{t("submit")}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdown: {
    backgroundColor: "white",
    borderColor: "#ddd",
  },
  dropdownList: {
    backgroundColor: "white",
    borderColor: "#ddd",
  },

  submitButton: {
    backgroundColor: colors.customBlueDarker,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  selectedItemContainer: {
    backgroundColor: colors.lightGray,
  },
  selectedItemLabel: {
    fontWeight: "bold",
  },
});

export default ProductForm;
