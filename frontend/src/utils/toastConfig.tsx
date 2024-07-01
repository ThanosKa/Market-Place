import React from "react";
import {
  BaseToast,
  ErrorToast,
  BaseToastProps,
} from "react-native-toast-message";
import { StyleSheet } from "react-native";
import { colors } from "../colors/colors"; // Adjust the import path as needed

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  warning: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={styles.warningToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: colors.success,
  },
  errorToast: {
    borderLeftColor: colors.error,
  },
  infoToast: {
    borderLeftColor: colors.info,
  },
  warningToast: {
    borderLeftColor: colors.warning,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  text2: {
    fontSize: 14,
    color: colors.secondary,
  },
});
