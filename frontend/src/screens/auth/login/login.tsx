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

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList & RootStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: Implement actual login logic here
    console.log("Login attempted with:", email, password);

    // Simulate successful login
    if (email && password) {
      // Navigate to the main app
      navigation.navigate("Main");
    } else {
      // Show an error message (you might want to use a proper alert or error state)
      console.log("Please enter both email and password");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth.login")}</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t("auth.loginButton")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>{t("auth.registerLink")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.link}>{t("auth.forgotPasswordLink")}</Text>
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
    color: colors.primary,
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
    color: colors.secondary,
    marginTop: 20,
    fontSize: 16,
  },
});

export default LoginScreen;
