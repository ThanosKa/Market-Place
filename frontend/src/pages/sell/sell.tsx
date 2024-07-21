import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { axiosFormDataInstance } from "../../services/axiosConfig";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import CameraComponent from "./CameraComponent";
import ImageGallery from "./ImageGallery";
import ProductForm, { ProductFormData } from "./ProductForm";
import Toast from "react-native-toast-message";

export interface SellScreenRef {
  resetState: () => void;
}

const MainSellScreen = forwardRef<SellScreenRef, {}>((props, ref) => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  const [images, setImages] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(true);

  const resetState = () => {
    setImages([]);
    setIsCameraOpen(true);
  };

  useImperativeHandle(ref, () => ({
    resetState,
  }));

  const mutation = useMutation(
    (formData: FormData) => axiosFormDataInstance.post("/products", formData),
    {
      onSuccess: () => {
        // Alert.alert(t("Success"), t("Product listed successfully"));
        resetState();
        handleCloseCamera(); // Add this line to call handleCloseCamera on success
        Toast.show({
          type: "success",
          text1: t("success"),
          text2: t("product-upload-success"),
          position: "bottom",
          bottomOffset: 110,
        });
      },
      onError: (error) => {
        // console.error("Error submitting product:", error);
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
    navigation.navigate("Home", {
      searchQuery: undefined,
      refreshHome: Date.now(),
    });
  };

  const handleSubmit = (formData: ProductFormData) => {
    if (
      !formData.title ||
      !formData.price ||
      !formData.category ||
      !formData.condition ||
      images.length === 0
    ) {
      Alert.alert(
        t("Error"),
        t("Please fill all fields and add at least one image")
      );
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append("title", formData.title);
    submitFormData.append("price", formData.price);
    submitFormData.append("category", formData.category as string);
    submitFormData.append("condition", formData.condition as string);

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
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageGallery
        images={images}
        onRemoveImage={handleRemoveImage}
        onOpenCamera={() => setIsCameraOpen(true)}
      />
      {images.length === 0 && (
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={() => setIsCameraOpen(true)}
        >
          <Text style={styles.retakeButtonText}>{t("Re-take photos")}</Text>
        </TouchableOpacity>
      )}
      <ProductForm onSubmit={handleSubmit} isLoading={mutation.isLoading} />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  retakeButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  retakeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MainSellScreen;
