import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { ChatMessage } from "../../interfaces/chat";
import { useTranslation } from "react-i18next";

interface MessageOptionsProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  onDelete: () => void;
}

const MessageOptions: React.FC<MessageOptionsProps> = ({
  message,
  isOwnMessage,
  onDelete,
}) => {
  const { t } = useTranslation();

  if (!isOwnMessage) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.optionsContainer} onPress={onDelete}>
      <Text style={styles.optionText}>{t("unsend")}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
    width: "auto",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionText: {
    color: "red",
    fontSize: 16,
  },
});

export default MessageOptions;
