// services/authService.ts
import axiosInstance, { axiosFormDataInstance } from "./axiosConfig";
import {
  setAuthToken,
  removeAuthToken,
  setUserId,
  setRefreshToken,
  getRefreshToken,
} from "./authStorage";
import { LoginFormData, RegisterFormData } from "../interfaces/auth/auth";

export const registerUser = async (userData: RegisterFormData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (userData: LoginFormData) => {
  console.log("Attempting login with:", userData);
  try {
    const response = await axiosInstance.post("/auth/login", userData);
    const { access_token, refresh_token, user } = response.data.data;
    console.log("Storing tokens and user data");
    await setAuthToken(access_token);
    await setRefreshToken(refresh_token);
    await setUserId(user.id);

    return { message: response.data.message, user };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Example of a form-data API call
export const uploadUserAvatar = async (userId: string, avatarFile: File) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await axiosFormDataInstance.post(
      `/users/${userId}/avatar`,
      formData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add other auth-related API calls here

export const refreshAuthToken = async () => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axiosInstance.post("/auth/refresh-token", {
      refresh_token: refreshToken,
    });
    const { access_token, refresh_token } = response.data.data;

    await setAuthToken(access_token);
    if (refresh_token) {
      await setRefreshToken(refresh_token);
    }

    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};
