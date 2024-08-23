import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Camera, CameraType, FlashMode } from "expo-camera/legacy";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";

interface CameraComponentProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
  onPickImages: (uris: string[]) => void;
  currentImageCount: number;
  showGallery?: boolean;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onCapture,
  onClose,
  onPickImages,
  currentImageCount,
  showGallery = true,
}) => {
  const { t } = useTranslation();
  const [type, setType] = useState<CameraType>(CameraType.back);
  const [flash, setFlash] = useState<FlashMode>(FlashMode.off);
  const [isSelectingImages, setIsSelectingImages] = useState(false);
  const cameraRef = useRef<Camera | null>(null);

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlash = () => {
    setFlash((current) =>
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
        });
        if (photo && photo.uri) {
          onCapture(photo.uri);
        }
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handlePickImages = async () => {
    setIsSelectingImages(true);
    try {
      const remainingSlots = 5 - currentImageCount;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets) {
        const selectedUris = result.assets.map((asset) => asset.uri);

        onPickImages(selectedUris.slice(0, remainingSlots));
        onClose();
      } else {
      }
    } catch (error) {
      console.error("CameraComponent: Error picking images:", error);
    } finally {
      setIsSelectingImages(false);
    }
  };

  return (
    <View style={styles.fullScreenContainer}>
      <Camera
        style={styles.fullScreenCamera}
        type={type}
        ref={cameraRef}
        flashMode={flash}
      >
        <View style={styles.cameraTopContainer}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={toggleFlash}>
            <Ionicons
              name={flash === FlashMode.on ? "flash" : "flash-off"}
              size={32}
              color="white"
            />
          </TouchableOpacity>
        </View>
        {isSelectingImages && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>{t("processing-images")}</Text>
          </View>
        )}
      </Camera>
      <View style={styles.cameraBottomContainer}>
        <View style={styles.bottomButtonsWrapper}>
          {showGallery ? (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handlePickImages}
              disabled={isSelectingImages}
            >
              <Ionicons name="images" size={32} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderButton} />
          )}
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
          />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={toggleCameraType}
          >
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const { width: screenWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  fullScreenCamera: {
    flex: 1,
  },
  cameraBottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
  },
  bottomButtonsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    width: screenWidth,
  },
  cameraButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
    borderRadius: 30,
  },
  placeholderButton: {
    width: 72, // Same width as cameraButton
    height: 72, // Same height as cameraButton
  },
  cameraTopContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    borderWidth: 5,
    borderColor: "rgba(0,0,0,0.6)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
});

export default CameraComponent;
