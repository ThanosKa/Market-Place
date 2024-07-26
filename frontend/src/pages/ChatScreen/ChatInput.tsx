import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const { t } = useTranslation();
  const [inputMessage, setInputMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const MAX_INPUT_HEIGHT = 100;

  const handleContentSizeChange = useCallback(
    (contentWidth: number, contentHeight: number) => {
      const newHeight = Math.min(contentHeight, MAX_INPUT_HEIGHT);
      setInputHeight(newHeight);
    },
    []
  );

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage === "") return;

    const messageLines = trimmedMessage
      .split("\n")
      .filter((line) => line.trim() !== "");
    const finalMessage = messageLines.join("\n");

    onSendMessage(finalMessage);
    setInputMessage("");
    setInputHeight(40);
  }, [inputMessage, onSendMessage]);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, { height: inputHeight }]}
        value={inputMessage}
        onChangeText={setInputMessage}
        placeholder={t("typeMessage")}
        placeholderTextColor="#8e8e8e"
        multiline
        onContentSizeChange={(e) =>
          handleContentSizeChange(
            e.nativeEvent.contentSize.width,
            e.nativeEvent.contentSize.height
          )
        }
      />
      <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
        <Text style={styles.sendButtonText}>{t("send")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#0084ff",
    fontWeight: "600",
  },
});

export default ChatInput;
