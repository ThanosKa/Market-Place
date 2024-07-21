import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
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
  const singleImageWidth = screenWidth * 0.95;
  const multipleImageWidth = screenWidth * 0.8;
  const imageHeight = singleImageWidth * 0.75;

  const imageWidth =
    images.length === 1 ? singleImageWidth : multipleImageWidth;

  const handleRemoveImage = (index: number) => {
    Alert.alert(
      t("remove-image"),
      t("remove-image-confirmation"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          onPress: () => {
            onRemoveImage(index);
            if (images.length === 1) {
              onOpenCamera();
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.imageSection}>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.imageWrapper,
              { width: imageWidth, height: imageHeight },
            ]}
          >
            <Image
              source={{ uri: item }}
              style={[styles.image, { width: imageWidth, height: imageHeight }]}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={
          images.length === 1
            ? styles.singleImageContainer
            : styles.multipleImagesContainer
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageSection: {
    marginVertical: 20,
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
    borderRadius: 12,
    padding: 5,
  },
  singleImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  multipleImagesContainer: {
    paddingRight: 20,
  },
});

export default ImageGallery;
