// services/authService.ts
import axiosInstance, { axiosFormDataInstance } from "./axiosConfig";
import { setAuthToken, removeAuthToken, setUserId } from "./authStorage";
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
  try {
    const response = await axiosInstance.post("/auth/login", userData);
    const { token, user } = response.data.data;
    await setAuthToken(token);
    await setUserId(user.id);
    return { message: response.data.message, user };
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await axiosInstance.post("/auth/logout");
    await removeAuthToken();
  } catch (error) {
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
