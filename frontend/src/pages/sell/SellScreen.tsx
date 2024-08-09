// SellScreen.tsx

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  View,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { axiosFormDataInstance } from "../../services/axiosConfig";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import CameraComponent from "./CameraComponent";
import ImageGallery from "./ImageGallery";
import ProductForm, { ProductFormData } from "./ProductForm";
import Toast from "react-native-toast-message";

export interface SellScreenRef {
  resetState: () => void;
}

const SellScreen = forwardRef<SellScreenRef, {}>((props, ref) => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);

  const [images, setImages] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    price: "",
    category: null,
    condition: null,
  });

  useEffect(() => {
    setIsCameraOpen(true);
  }, []);

  const resetState = () => {
    setImages([]);
    setIsCameraOpen(true);
    setFormData({
      title: "",
      price: "",
      category: null,
      condition: null,
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: !isCameraOpen,
    });
  }, [navigation, isCameraOpen]);

  useImperativeHandle(ref, () => ({
    resetState,
  }));

  const mutation = useMutation(
    (formData: FormData) => axiosFormDataInstance.post("/products", formData),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: t("success"),
          text2: t("product-upload-success"),
          position: "bottom",
          bottomOffset: 110,
        });
        navigation.navigate("Home", { refreshHome: Date.now() });
      },
      onError: (error) => {
        Alert.alert(t("Error"), t("Failed to list product. Please try again."));
      },
    }
  );

  const handleCapture = (uri: string) => {
    setImages((prevImages) => [...prevImages, uri].slice(0, 5));
    setIsCameraOpen(false);
  };

  const handlePickImages = (selectedUris: string[]) => {
    setImages((prevImages) => [...prevImages, ...selectedUris].slice(0, 5));
    setIsCameraOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      const newImages = prevImages.filter((_, i) => i !== index);
      if (newImages.length === 0) {
        setIsCameraOpen(true);
      }
      return newImages;
    });
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
    if (images.length === 0) {
      navigation.navigate("Home", {
        searchQuery: undefined,
        refreshHome: undefined,
      });
    }
  };

  const handleSubmit = (submittedFormData: ProductFormData) => {
    if (
      !submittedFormData.title ||
      !submittedFormData.price ||
      !submittedFormData.category ||
      !submittedFormData.condition ||
      images.length === 0
    ) {
      Alert.alert(
        t("Error"),
        t("Please fill all fields and add at least one image")
      );
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append("title", submittedFormData.title);
    submitFormData.append("price", submittedFormData.price);
    submitFormData.append("category", submittedFormData.category as string);
    submitFormData.append("condition", submittedFormData.condition as string);

    images.forEach((image, index) => {
      submitFormData.append("images", {
        uri: image,
        type: "image/jpeg",
        name: `image_${index}.jpg`,
      } as any);
    });

    mutation.mutate(submitFormData);
  };

  if (isCameraOpen) {
    return (
      <CameraComponent
        onCapture={handleCapture}
        onClose={handleCloseCamera}
        onPickImages={handlePickImages}
        currentImageCount={images.length}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ImageGallery
          images={images}
          onRemoveImage={handleRemoveImage}
          onOpenCamera={() => setIsCameraOpen(true)}
        />
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={mutation.isLoading}
          formData={formData}
          setFormData={setFormData}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default SellScreen;
