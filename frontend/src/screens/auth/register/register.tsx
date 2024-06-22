import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  AuthStackParamList,
  RootStackParamList,
} from "../../../interfaces/auth/navigation";
import { colors } from "../../../colors/colors";

type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList & RootStackParamList,
  "Register"
>;

const RegisterScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    // Implement registration logic here
    console.log(
      "Registration attempted with:",
      email,
      password,
      confirmPassword
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth.register")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("auth.email")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.showHideText}>
            {showPassword ? t("auth.hide") : t("auth.show")}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={t("auth.confirmPassword")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Text style={styles.showHideText}>
            {showConfirmPassword ? t("auth.hide") : t("auth.show")}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>{t("auth.registerButton")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>{t("auth.loginLink")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
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
    marginBottom: 15,
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
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    color: colors.primary,
    marginTop: 20,
    fontSize: 16,
  },
});

export default RegisterScreen;
