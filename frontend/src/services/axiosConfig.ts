// services/axiosConfig.ts
import axios from "axios";
import env from "../config/env"; // Adjust the import path as necessary
import { getAuthToken, removeAuthToken } from "./authStorage";
import { navigate } from "../navigation/navigationRef";
import { Alert } from "react-native";
import i18n from "../utils/i18n";

const API_URL = `${env.PROTOCOL}://${env.SERVER}:${env.PORT}/${env.API_BASEPATH}`;
export const BASE_URL = `${env.PROTOCOL}://${env.SERVER}:${env.PORT}`;

if (!env.PROTOCOL || !env.SERVER || !env.PORT) {
  console.error("Environment variables are not set correctly");
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const { token } = await getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      await removeAuthToken();
      navigate("Auth"); // Navigate to the Auth screen
    }
    return Promise.reject(error);
  }
);

export const axiosFormDataInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

axiosFormDataInstance.interceptors.request.use(
  async (config) => {
    const { token } = await getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// In your axios interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      navigate("AuthLoading");
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;
