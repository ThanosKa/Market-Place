import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraType, FlashMode } from "expo-camera/legacy";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";

interface CameraComponentProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
  onPickImages: (uris: string[]) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onCapture,
  onClose,
  onPickImages,
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

  const handlePickImages = async () => {
    setIsSelectingImages(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets) {
        const selectedUris = result.assets.map((asset) => asset.uri);
        console.log("Images selected from gallery:", selectedUris);
        onPickImages(selectedUris);
      } else {
        console.log("Image selection cancelled or no images selected");
      }
    } catch (error) {
      console.error("Error picking images:", error);
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
          <TouchableOpacity style={styles.cameraButton} onPress={onClose}>
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
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handlePickImages}
          disabled={isSelectingImages}
        >
          <Ionicons name="images" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={toggleCameraType}
        >
          <Ionicons name="camera-reverse" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  fullScreenCamera: {
    flex: 1,
  },
  cameraTopContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  cameraBottomContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  cameraButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 30,
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
