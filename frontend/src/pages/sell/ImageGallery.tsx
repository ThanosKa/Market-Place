// ImageGallery.tsx

import React, { useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";

interface ImageGalleryProps {
  images: string[];
  onRemoveImage: (index: number) => void;
  onOpenCamera: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onRemoveImage,
  onOpenCamera,
}) => {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth * 0.9;
  const imageHeight = imageWidth * 0.75;

  const handleRemoveImage = (index: number) => {
    Alert.alert(
      t("remove-image"),
      t("remove-image-confirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          onPress: () => onRemoveImage(index),
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.imageSection}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imageContainer}
      >
        {images.map((image, index) => (
          <View
            key={index}
            style={[
              styles.imageWrapper,
              { width: imageWidth, height: imageHeight },
            ]}
          >
            <Image
              source={{ uri: image }}
              style={[styles.image, { width: imageWidth, height: imageHeight }]}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 5 && (
          <TouchableOpacity
            style={[
              styles.addImageButton,
              { width: imageWidth, height: imageHeight },
            ]}
            onPress={onOpenCamera}
          >
            <Feather name="plus" size={40} color={colors.primary} />
            <Text style={styles.addImageText}>{t("add-image")}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  imageSection: {
    marginVertical: 20,
  },
  imageContainer: {
    paddingHorizontal: 10,
  },
  imageWrapper: {
    marginRight: 10,
  },
  image: {
    borderRadius: 10,
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    padding: 5,
  },
  addImageButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderStyle: "dashed",
  },
  addImageText: {
    marginTop: 10,
    color: colors.secondary,
  },
});

export default ImageGallery;
