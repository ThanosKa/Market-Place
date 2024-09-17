import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../../interfaces/auth/navigation";
import { colors } from "../../../colors/colors";
import { useForm, Controller } from "react-hook-form";
import { editUser } from "../../../services/user";
import Toast from "react-native-toast-message";
import {
  ChangePasswordFormData,
  createChangePasswordSchema,
} from "../../../schema/auth";
import { yupResolver } from "@hookform/resolvers/yup";

type ChangePasswordScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "ChangePasswordScreen"
>;

const ChangePasswordScreen: React.FC<{
  navigation: ChangePasswordScreenNavigationProp;
}> = ({ navigation }) => {
  const { t } = useTranslation();
  const changePasswordSchema = createChangePasswordSchema(t);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
  });
  const [showPassword, setShowPassword] = React.useState<{
    currentPassword: boolean;
    newPassword: boolean;
    confirmNewPassword: boolean;
  }>({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const currentPassword = useRef<TextInput>(null);
  const newPassword = useRef<TextInput>(null);
  const confirmNewPassword = useRef<TextInput>(null);
  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const formData = new FormData();
      formData.append("currentPassword", data.currentPassword);
      formData.append("newPassword", data.newPassword);
      formData.append("confirmNewPassword", data.confirmNewPassword);

      const response = await editUser(formData);
      reset();
      if (response?.success === 1) {
        currentPassword.current?.blur();
        newPassword.current?.blur();
        confirmNewPassword.current?.blur();

        Toast.show({
          type: "success",
          text1: t("success"),
          text2: t("success-change-password"),
          position: "bottom",
          bottomOffset: 110,
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: t("password-mismatch"),
          text2: t("fail-change-password"),
          position: "bottom",
          bottomOffset: 110,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("fail-change-password"),
        position: "bottom",
        bottomOffset: 110,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>{t("change-password")}</Text>
        <Text style={styles.description}>{t("password-requirements")}</Text>

        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.passwordContainer,
                  focusedField === "currentPassword" && styles.focusedInput,
                  errors.currentPassword && styles.errorInput,
                ]}
              >
                <TextInput
                  ref={currentPassword}
                  style={styles.passwordInput}
                  placeholder={t("enter-current-password")}
                  onBlur={() => {
                    onBlur();
                    setFocusedField(null);
                  }}
                  onFocus={() => setFocusedField("currentPassword")}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword.currentPassword}
                />
                <TouchableOpacity
                  onPress={() =>
                    setShowPassword({
                      ...showPassword,
                      currentPassword: !showPassword.currentPassword,
                    })
                  }
                >
                  <Text style={styles.showHideText}>
                    {showPassword.currentPassword
                      ? t("auth.hide")
                      : t("auth.show")}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <Text style={styles.errorText}>
                  {errors.currentPassword.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.passwordContainer,
                  focusedField === "newPassword" && styles.focusedInput,
                  errors.newPassword && styles.errorInput,
                ]}
              >
                <TextInput
                  ref={newPassword}
                  style={styles.passwordInput}
                  placeholder={t("enter-new-password")}
                  onBlur={() => {
                    onBlur();
                    setFocusedField(null);
                  }}
                  onFocus={() => setFocusedField("newPassword")}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword.newPassword}
                />
                <TouchableOpacity
                  onPress={() =>
                    setShowPassword({
                      ...showPassword,
                      newPassword: !showPassword.newPassword,
                    })
                  }
                >
                  <Text style={styles.showHideText}>
                    {showPassword.newPassword ? t("auth.hide") : t("auth.show")}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text style={styles.errorText}>
                  {errors.newPassword.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmNewPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.passwordContainer,
                  focusedField === "confirmNewPassword" && styles.focusedInput,
                  errors.confirmNewPassword && styles.errorInput,
                ]}
              >
                <TextInput
                  ref={confirmNewPassword}
                  style={styles.passwordInput}
                  placeholder={t("confirm-new-password")}
                  onBlur={() => {
                    onBlur();
                    setFocusedField(null);
                  }}
                  onFocus={() => setFocusedField("confirmNewPassword")}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword.confirmNewPassword}
                />
                <TouchableOpacity
                  onPress={() =>
                    setShowPassword({
                      ...showPassword,
                      confirmNewPassword: !showPassword.confirmNewPassword,
                    })
                  }
                >
                  <Text style={styles.showHideText}>
                    {showPassword.confirmNewPassword
                      ? t("auth.hide")
                      : t("auth.show")}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmNewPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmNewPassword.message}
                </Text>
              )}
            </View>
          )}
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>{t("change-password")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.primary,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "left",
    color: colors.secondary,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "white",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  showHideText: {
    color: colors.primary,
    paddingRight: 15,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 35,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.customBlueDarker,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  focusedInput: {
    borderColor: colors.secondary,
    borderWidth: 1,
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default ChangePasswordScreen;
