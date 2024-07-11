import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthStackParamList } from "../interfaces/auth/navigation";
import LoginScreen from "../pages/auth/login/login";
import RegisterScreen from "../pages/auth/register/register";
import ForgotPasswordScreen from "../pages/auth/forgotPass/forgotPass";

const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

export default AuthNavigator;
