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

interface EditProductFormProps {
  product: {
    title: string;
    price: number;
    description: string;
    category: string;
    condition: string;
  };
  onSave: (updatedProduct: any) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  product,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(product.price.toString());
  const [description, setDescription] = useState(product.description);
  const [category, setCategory] = useState(product.category);
  const [condition, setCondition] = useState(product.condition);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = () => {
    setIsSaving(true);
    onSave({
      title,
      price: parseFloat(price),
      description,
      category,
      condition,
    });
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("title")}</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t("e.g. iPhone 13")}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("price")}</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder={t("e.g. 250")}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("description")}</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={description}
          onChangeText={setDescription}
          placeholder={t("description")}
          multiline
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
          maxHeight={200}
          listMode="SCROLLVIEW"
        />
      </View>

      <View style={[styles.inputContainer, { zIndex: 2000 }]}>
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
          maxHeight={200}
          listMode="SCROLLVIEW"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>{t("save")}</Text>
          )}
        </TouchableOpacity>
      </View>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 46,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdown: {
    backgroundColor: "white",
    borderColor: "#ddd",
    height: 46,
  },
  dropdownList: {
    backgroundColor: "white",
    borderColor: "#ddd",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
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
  selectedItemContainer: {
    backgroundColor: colors.lightGray,
  },
  selectedItemLabel: {
    fontWeight: "bold",
  },
});

export default EditProductForm;
