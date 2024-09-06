import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { colors } from "../../../colors/colors";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../../interfaces/auth/navigation";
import { editUser, getUserDetails } from "../../../services/user";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Toast from "react-native-toast-message";
import { Animated } from "react-native";

type ChangeEmailScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "ChangeEmailScreen"
>;

type Props = {
  navigation: ChangeEmailScreenNavigationProp;
};

const changeEmailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

type ChangeEmailFormData = Yup.InferType<typeof changeEmailSchema>;

const ChangeEmailScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const emailInputRef = useRef<TextInput>(null);

  const {
    data: userData,
    isLoading: userLoading,
    refetch: refetchUserDetails,
  } = useQuery("userDetails", getUserDetails);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangeEmailFormData>({
    resolver: yupResolver(changeEmailSchema),
  });

  const changeEmailMutation = useMutation(editUser, {
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data) => {
      if (data === null) {
        // Handle error case
        setIsLoading(false);
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("email-update-failed"),
          position: "bottom",
          bottomOffset: 110,
        });
      } else {
        setIsLoading(false);

        queryClient.invalidateQueries("loggedUser");
        emailInputRef.current?.blur();
        Toast.show({
          type: "success",
          text1: t("success"),
          text2: t("email-update-success"),
          position: "bottom",
          bottomOffset: 110,
        });

        fadeOutCurrentEmail();
      }
    },
    onError: () => {
      // This shouldn't be called now, but keep it just in case
      setIsLoading(false);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("email-update-failed"),
        position: "bottom",
        bottomOffset: 110,
      });
    },
  });

  const onSubmit = (data: ChangeEmailFormData) => {
    const formData = new FormData();
    formData.append("email", data.email);
    changeEmailMutation.mutate(formData);
  };

  const fadeOutCurrentEmail = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      refetchUserDetails();
      fadeInCurrentEmail();
    });
  };

  const fadeInCurrentEmail = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  if (userLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" />
      </View>
    );
  }
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>{t("change-email")}</Text>
        <Text style={styles.description}>
          {t("enter-new-email-description")}
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("current-email")}</Text>
          <Animated.View style={{ opacity: fadeAnim }}>
            <TextInput
              style={[styles.emailInput, styles.disabledInput]}
              value={userData?.data?.user.email}
              editable={false}
            />
          </Animated.View>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("new-email")}</Text>
              <View
                style={[
                  styles.emailContainer,
                  isFocused && styles.focusedInput,
                  errors.email && styles.errorInput,
                ]}
              >
                <TextInput
                  ref={emailInputRef}
                  style={styles.emailInput}
                  placeholder={t("enter-new-email")}
                  onBlur={() => {
                    onBlur();
                    setIsFocused(false);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>
          )}
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            (isSubmitting || isLoading) && styles.disabledButton,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>{t("change-email")}</Text>
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
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: colors.secondary,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "white",
    borderColor: colors.secondary,
    borderWidth: 0.25,
    borderRadius: 5,
  },
  emailInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#888",
    borderColor: colors.secondary,
    borderWidth: 0.25,
    borderRadius: 5,
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
  errorInput: {
    borderColor: "red",
    borderWidth: 0.5,
  },
  focusedInput: {
    borderColor: colors.primary,
    borderWidth: 0.5,
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

export default ChangeEmailScreen;
