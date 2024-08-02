import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  Platform,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../colors/colors";
import * as ImagePicker from "expo-image-picker";
import CameraComponent from "../sell/CameraComponent";

interface TextInputComponentProps extends TextInputProps {
  handleSendMessage: (text: string, images: string[]) => void;
}

const ChatInput: React.FC<TextInputComponentProps> = ({
  value,
  onChangeText,
  handleSendMessage,
  ...props
}) => {
  const [inputHeight, setInputHeight] = useState(40);
  const MIN_INPUT_HEIGHT = 40;
  const MAX_INPUT_HEIGHT = 100;
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const textInputRef = useRef<TextInput>(null);

  const handleContentSizeChange = (event: any) => {
    const height = event.nativeEvent.contentSize.height;
    setInputHeight(
      Math.min(Math.max(height, MIN_INPUT_HEIGHT), MAX_INPUT_HEIGHT)
    );
  };

  const isQueryEmpty =
    value?.trim().length === 0 && selectedImages.length === 0;

  const openCamera = () => {
    setIsCameraOpen(true);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
  };

  const handleCapture = (uri: string) => {
    console.log("Captured image URI:", uri);
    setSelectedImages((prevImages) => [...prevImages, uri]);
    closeCamera();
  };

  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: 5 - selectedImages.length,
      });

      if (!result.canceled && result.assets) {
        const newUris = result.assets.map((asset) => asset.uri);
        console.log("Selected image URIs:", newUris);
        setSelectedImages((prevImages) => [...prevImages, ...newUris]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  const sendMessage = () => {
    console.log("Sending images:", selectedImages);
    handleSendMessage(value || "", selectedImages);
    onChangeText?.("");
    setSelectedImages([]);
    textInputRef.current?.clear();
  };

  return (
    <View style={styles.container}>
      {selectedImages.length > 0 && (
        <ScrollView horizontal style={styles.imagePreviewContainer}>
          {selectedImages.map((uri, index) => (
            <View key={index} style={styles.imagePreview}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={openCamera}>
          <Ionicons name="camera" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={textInputRef}
            style={[styles.input, { height: inputHeight }]}
            value={value}
            onChangeText={onChangeText}
            onContentSizeChange={handleContentSizeChange}
            placeholder="Type a message..."
            placeholderTextColor="#8e8e8e"
            multiline
            {...props}
          />
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={isQueryEmpty ? handlePickImages : sendMessage}
        >
          <Ionicons
            name={isQueryEmpty ? "images" : "send"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <Modal visible={isCameraOpen} animationType="slide">
        <CameraComponent
          onCapture={handleCapture}
          onClose={closeCamera}
          onPickImages={(uris) =>
            setSelectedImages((prevImages) => [...prevImages, ...uris])
          }
          currentImageCount={selectedImages.length}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    marginHorizontal: 8,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconButton: {
    backgroundColor: "#0084ff",
    padding: 8,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  chevron: {
    padding: 8,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    padding: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
});

export default ChatInput;
