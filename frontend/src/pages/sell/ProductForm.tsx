import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
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
  description: string;
  category: string | null;
  condition: string | null;
}

interface ProductFormProps {
  onSubmit: (formData: ProductFormData) => void;
  isLoading: boolean;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  isLoading,
  formData,
  setFormData,
}) => {
  const { t } = useTranslation();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [localCategory, setLocalCategory] = useState<string | null>(
    formData.category
  );
  const [localCondition, setLocalCondition] = useState<string | null>(
    formData.condition
  );

  const fadeAnim = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      category: localCategory,
      condition: localCondition,
    }));
  }, [localCategory, localCondition]);

  const handleChange = (field: keyof ProductFormData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (text: string) => {
    const numericPrice = text.replace(/[^0-9]/g, "");
    handleChange("price", numericPrice);
  };

  const isNextDisabled = !formData.title.trim() || !formData.price.trim();

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const renderStep1 = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("title")}</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => handleChange("title", text)}
          placeholder={t("e.g. iPhone 13")}
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t("price")}</Text>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={handlePriceChange}
          placeholder={t("e.g. 250")}
          keyboardType="numeric"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {t("description")} ({t("optional")})
        </Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={formData.description}
          onChangeText={(text) => handleChange("description", text)}
          placeholder={t("Enter product description")}
          multiline={true}
          numberOfLines={4}
          editable={!isLoading}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.nextButton,
          (isNextDisabled || isLoading) && styles.disabledButton,
        ]}
        onPress={handleNext}
        disabled={isNextDisabled || isLoading}
      >
        <Text style={styles.nextButtonText}>{t("Next")}</Text>
      </TouchableOpacity>
    </>
  );
  const renderStep2 = () => (
    <>
      <View style={[styles.inputContainer, { zIndex: 3000 }]}>
        <Text style={styles.label}>{t("category")}</Text>
        <DropDownPicker
          open={categoryOpen}
          value={localCategory}
          items={categories.map((cat) => ({
            label: t(cat.label),
            value: cat.value,
          }))}
          setOpen={setCategoryOpen}
          setValue={setLocalCategory}
          placeholder={t("select-category")}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          selectedItemContainerStyle={styles.selectedItemContainer}
          selectedItemLabelStyle={styles.selectedItemLabel}
          maxHeight={200}
          listMode="SCROLLVIEW"
          disabled={isLoading}
        />
      </View>

      <View style={[styles.inputContainer, { zIndex: 2000 }]}>
        <Text style={styles.label}>{t("condition")}</Text>
        <DropDownPicker
          open={conditionOpen}
          value={localCondition}
          items={conditions.map((cond) => ({
            label: t(cond.label),
            value: cond.value,
          }))}
          setOpen={setConditionOpen}
          setValue={setLocalCondition}
          placeholder={t("select-condition")}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          selectedItemContainerStyle={styles.selectedItemContainer}
          selectedItemLabelStyle={styles.selectedItemLabel}
          maxHeight={200}
          listMode="SCROLLVIEW"
          disabled={isLoading}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { flex: 1, marginRight: 10 },
            isLoading && styles.disabledButton,
          ]}
          onPress={handleBack}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>{t("back")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { flex: 1 },
            isLoading && styles.disabledButton,
          ]}
          onPress={() => onSubmit(formData)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>{t("submit")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.formContainer}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </Animated.View>
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
  dropdown: {
    backgroundColor: "white",
    borderColor: "#ddd",
    height: 46,
  },
  dropdownList: {
    backgroundColor: "white",
    borderColor: "#ddd",
  },
  nextButton: {
    backgroundColor: colors.customBlueDarker,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "white",
    borderColor: colors.customBlueDarker,
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: colors.customBlueDarker,
    fontWeight: "bold",
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: colors.customBlueDarker,
    padding: 15,
    borderRadius: 12,
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
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
});

export default ProductForm;
