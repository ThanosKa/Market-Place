import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../colors/colors";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onOpenCamera: () => void;
  onSelectImages: (uris: string[]) => void;
  initialValue?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onOpenCamera,
  onSelectImages,
  initialValue = "",
}) => {
  const { t } = useTranslation();
  const [inputMessage, setInputMessage] = useState(initialValue);
  const [inputHeight, setInputHeight] = useState(40);

  useEffect(() => {
    setInputMessage(initialValue);
  }, [initialValue]);

  const MIN_INPUT_HEIGHT = 40;
  const MAX_INPUT_HEIGHT = 100; // This is approximately 4-5 lines

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage === "") return;

    const messageLines = trimmedMessage
      .split("\n")
      .filter((line) => line.trim() !== "");
    const finalMessage = messageLines.join("\n");

    onSendMessage(finalMessage);
    setInputMessage("");
    setInputHeight(MIN_INPUT_HEIGHT);
  }, [inputMessage, onSendMessage]);

  const handleSelectImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      onSelectImages(selectedUris);
    }
  };

  const handleChangeText = useCallback((text: string) => {
    setInputMessage(text);
  }, []);

  const handleContentSizeChange = (event: any) => {
    const height = event.nativeEvent.contentSize.height;
    setInputHeight(
      Math.min(Math.max(height, MIN_INPUT_HEIGHT), MAX_INPUT_HEIGHT)
    );
  };

  const handleResetQuery = useCallback(() => {
    setInputMessage("");
    setInputHeight(MIN_INPUT_HEIGHT);
  }, []);

  const isQueryEmpty = inputMessage.trim().length === 0;

  return (
    <View style={styles.inputContainer}>
      {isQueryEmpty ? (
        <TouchableOpacity onPress={onOpenCamera} style={styles.iconButton}>
          <Ionicons name="camera" size={20} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleResetQuery} style={styles.chevron}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.customBlue}
          />
        </TouchableOpacity>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { height: inputHeight }]}
          value={inputMessage}
          onChangeText={handleChangeText}
          onContentSizeChange={handleContentSizeChange}
          placeholder={t("typeMessage")}
          placeholderTextColor="#8e8e8e"
          multiline
        />
      </View>
      {isQueryEmpty ? (
        <TouchableOpacity
          onPress={handleSelectImages}
          style={styles.iconButton}
        >
          <Ionicons name="images" size={20} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleSendMessage} style={styles.iconButton}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    backgroundColor: "#FFFFFF",
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
});

export default ChatInput;
