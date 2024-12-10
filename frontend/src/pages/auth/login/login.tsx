import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
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
import Google from "../../../../assets/logos/googleLogo.svg";
import Facebook from "../../../../assets/logos/fbLogo.svg";
import Apple from "../../../../assets/logos/appleLogo.svg";
import { Ionicons } from "@expo/vector-icons";
import { useOAuth, useUser, useAuth, Clerk } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { logout, setAuthToken, setRefreshToken, setUserId } from "../../../services/authStorage";
import axiosInstance from "../../../services/axiosConfig";

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList & RootStackParamList,
  "Login"
>;

 

 
const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

const LoginScreen = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  useWarmUpBrowser();
  const { t } = useTranslation();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuth();

  const loginSchema = React.useMemo(() => createLoginSchema(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });
  const [showPassword, setShowPassword] = useState(false);

  // Regular email/password login
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

  const redirectUrl = Linking.createURL("/oauth-native-callback");
  const { startOAuthFlow: startGoogleFlow } = useOAuth({
    strategy: "oauth_google",
    redirectUrl,
  });

  const [isClerkSignedIn, setIsClerkSignedIn] = useState(false); // Add this state

  const onGooglePress = React.useCallback(async () => {
    console.log("click")
    try {
      if (isClerkSignedIn) {
        await signOut();
        setIsClerkSignedIn(false);
        return;
      }
  
      setIsLoading(true);
      const { createdSessionId, setActive } = await startGoogleFlow() ?? {};
      
      if (!createdSessionId) {
        throw new Error("No session created");
      }
  
      // Wait for session to be active
      if (setActive) {
        console.log("setActive")
        await setActive({ session: createdSessionId });
      }
  
      // Wait for user data with a more robust check
      let attempts = 0;
      const maxAttempts = 20; // Increase max attempts
      let currentUser = null;
  
      while (attempts < maxAttempts) {
        if (user?.id && user?.primaryEmailAddress?.emailAddress) {
          currentUser = user;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 250)); // Shorter intervals
        attempts++;
      }
  
      if (!currentUser?.id) {
        throw new Error("Failed to get user data after authentication");
      }
  
      const userData = {
        clerkId: currentUser.id,
        email: currentUser.primaryEmailAddress?.emailAddress,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        imageUrl: currentUser.imageUrl || ''
      };

      console.log('Google OAuth user data:', userData);
      console.log('Sending user data to backend:', userData);
  
      const response = await axiosInstance.post("/auth/clerk-auth", userData);
      console.log('Backend response:', response.data);
  
      if (!response.data.success) {
        throw new Error(response.data.message || "Authentication failed");
      }
  
      const { access_token, refresh_token, user: appUser } = response.data.data;
      
      await Promise.all([
        setAuthToken(access_token),
        setRefreshToken(refresh_token),
        setUserId(appUser.id)
      ]);
  
      setIsClerkSignedIn(true);
      
      // Use setTimeout to ensure state updates are complete
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }, 100);
  
    } catch (err) {
      console.error("OAuth error:", err);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: err instanceof Error ? err.message : "Authentication failed",
        position: "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  }, [startGoogleFlow, navigation, isClerkSignedIn, signOut, user, t]);
  

  // Aclean up
  useEffect(() => {
    let mounted = true;
    const checkClerkSession = async () => {
      try {
        if (mounted) {
          setIsClerkSignedIn(!!isSignedIn);
        }
      } catch (error) {
        console.error("Error checking Clerk session:", error);
      }
    };
  
    checkClerkSession();
  
    return () => {
      mounted = false;
    };
  }, [isSignedIn]);
  

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      if (provider === "Google") {
        await onGooglePress();
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: `${provider} login failed`,
        position: "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        {isClerkSignedIn ? (
          // Show this when signed in with Clerk
          <View>
            <Text>Signed in with Clerk</Text>
            <View style={styles.profileContainer}>
      {user?.imageUrl && (
        <Image
          source={{ uri: user.imageUrl }}
          style={styles.profileImage}
        />
      )}
      <Text style={styles.profileText}>Welcome, {user?.firstName}!</Text>
      <View style={styles.userInfo}>
        <Text>Full Name: {`${user?.firstName} ${user?.lastName}`}</Text>
        <Text>Email: {user?.primaryEmailAddress?.emailAddress}</Text>
        <Text>User ID: {user?.id}</Text>
      </View>
    </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async () => {
                try {
                  await signOut();
                  setIsClerkSignedIn(false);
                } catch (error) {
                  console.error("Sign out error:", error);
                }
              }}
            >
              <Text style={styles.submitButtonText}>Sign Out from Clerk</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Not signed in with Clerk
          <>
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
                  style={[styles.loginButton, isLoading && styles.disabledButton]}
                  onPress={() => handleSocialLogin("Google")}
                  disabled={isLoading}
                >
                  <View style={styles.iconContainer}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Google width={24} height={24} />
                    )}
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
                        <Text style={styles.errorText}>
                          {errors.login.message}
                        </Text>
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
                  <Text style={styles.link}>
                    {t("auth.loginWithOtherOptions")}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                {t("auth.dontHaveAccount")}{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}>{t("auth.sign-up")}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
  profileContainer: {
    alignItems: "center",
    width: "100%",
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userInfo: {
    width: "100%",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 20,
  },
});

export default LoginScreen;
