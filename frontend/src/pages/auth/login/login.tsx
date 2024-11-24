import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  AuthStackParamList,
  RootStackParamList,
} from "../../../interfaces/auth/navigation";
import { colors } from "../../../colors/colors";
import { useForm, Controller } from "react-hook-form";
import { loginUser } from "../../../services/auth";
import Toast from "react-native-toast-message";
import { createLoginSchema } from "../../../schema/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginFormData } from "../../../interfaces/auth/auth";
import GoogleSVG from "../../../../assets/logos/googleLogo.svg";
import Facebook from "../../../../assets/logos/fbLogo.svg";
import Apple from "../../../../assets/logos/appleLogo.svg";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList & RootStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const loginSchema = React.useMemo(() => createLoginSchema(t), [t]);
  WebBrowser.maybeCompleteAuthSession();
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "120122687406-nqdrouv0kpnq0i6krrl912h1ov6uvoop.apps.googleusercontent.com",
    iosClientId:
      "120122687406-ncnenq5kve8fh3cm4vjoq9729hm8lov9.apps.googleusercontent.com",
    webClientId:
      "120122687406-894tbp08q0mq3r9mnqj20i6kppnimc0v.apps.googleusercontent.com",
    redirectUri: "http://localhost:5001",
  });

  useEffect(() => {
    handleGoogleSignInResponse();
  }, [response]);

  useEffect(() => {
    if (response?.type === "error") {
      console.error("Google Auth Error:", response.error);
    } else if (response?.type === "success") {
      const { authentication } = response;
      console.log("Authentication successful:", authentication);
    }
  }, [response]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginUser(data);
      reset();
      navigation.navigate("Main");
    } catch (error) {
      console.error("Login submission error:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("fail-login"),
        position: "bottom",
      });
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === "Google") {
      try {
        console.log("Authorization URL:", request?.url); // This will log the authorization URL
        await promptAsync();
      } catch (error) {
        console.error("Google sign in error:", error);
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("fail-login"),
          position: "bottom",
        });
      }
    } else {
      console.log(`Logging in with ${provider}`);
    }
  };
  const handleGoogleSignInResponse = async () => {
    if (response?.type === "success") {
      try {
        const { authentication } = response;
        // Get user info using the access token
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${authentication?.accessToken}` },
          }
        );

        const userInfo = await userInfoResponse.json();
        console.log("Google User Info:", userInfo);

        navigation.navigate("Main");
      } catch (error) {
        console.error("Error getting user info:", error);
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("fail-login"),
          position: "bottom",
        });
      }
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("auth.login")}</Text>
        <Text style={styles.text}>{t("auth.text")}</Text>

        {!showEmailLogin ? (
          <>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => setShowEmailLogin(true)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.loginButtonText}>
                {t("auth.useEmailOrUsername")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => handleSocialLogin("Google")}
            >
              <View style={styles.iconContainer}>
                <GoogleSVG width={24} height={24} />
              </View>
              <Text style={styles.loginButtonText}>
                {t("auth.loginWithGoogle")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => handleSocialLogin("Facebook")}
            >
              <View style={styles.iconContainer}>
                <Facebook width={28} height={28} />
              </View>
              <Text style={styles.loginButtonText}>
                {t("auth.loginWithFacebook")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => handleSocialLogin("Apple")}
            >
              <View style={styles.iconContainer}>
                <Apple width={24} height={24} />
              </View>
              <Text style={styles.loginButtonText}>
                {t("auth.loginWithApple")}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={t("auth.emailOrUsername")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                  {errors.login && (
                    <Text style={styles.errorText}>{errors.login.message}</Text>
                  )}
                </View>
              )}
              name="login"
            />
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={t("auth.password")}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.showHideText}>
                        {showPassword ? t("auth.hide") : t("auth.show")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text style={styles.errorText}>
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
              name="password"
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={styles.activityIndicator}
                />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t("auth.loginButton")}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.link}>{t("auth.forgotPasswordLink")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEmailLogin(false)}>
              <Text style={styles.link}>{t("auth.loginWithOtherOptions")}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>{t("auth.dontHaveAccount")} </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>{t("auth.sign-up")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.primary,
  },
  text: {
    fontSize: 16,
    marginBottom: 30,
    color: colors.secondary,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 15,
  },

  loginButtonText: {
    color: colors.primary,
    fontSize: 16,
    textAlign: "center",
    flex: 1,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 16,
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
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    color: colors.secondary,
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  activityIndicator: {
    height: 20,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
    color: colors.secondary,
  },
  registerLink: {
    fontSize: 16,
    color: colors.customBlueDarker,
  },
});

export default LoginScreen;
